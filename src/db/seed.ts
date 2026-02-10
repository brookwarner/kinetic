import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// Dynamic imports so env vars are loaded before db client is created
async function seed() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./index");
  const {
    physiotherapists,
    patients,
    gps,
    episodes,
    visits,
    consents,
    computedSignals,
    simulatedEligibility,
    gpPatientNotes,
    transitionEvents,
    continuityConsents,
    continuitySummaries,
  } = await import("./schema");
  const {
    physioScenarios,
    gpScenarios,
    gpPatientNoteScenarios,
    transitionScenarios,
    generatePatientProfiles,
    generateEpisodeTemplates,
  } = await import("./seed-scenarios");
  const { generateSummary } = await import("../lib/continuity/generate-summary");

  const dbUrl = process.env.TURSO_DATABASE_URL ?? "";
  const isLocalDb =
    !dbUrl ||
    dbUrl.startsWith("file:") ||
    dbUrl.startsWith("http://localhost") ||
    dbUrl.startsWith("https://localhost");
  const allowRemoteSeed = process.env.ALLOW_REMOTE_SEED === "true";

  if (!isLocalDb && !allowRemoteSeed) {
    console.error("❌ Refusing to seed a non-local database.");
    console.error(
      `Current TURSO_DATABASE_URL: ${dbUrl || "(not set; using default local path)"}`
    );
    console.error(
      "Set ALLOW_REMOTE_SEED=true only if you intentionally want to overwrite a remote DB."
    );
    process.exit(1);
  }

  console.log(`🌱 Starting seed... (${isLocalDb ? "local" : "remote"}: ${dbUrl || "file:local.db"})`);

  // Clear existing data (order matters for foreign keys)
  console.log("Clearing existing data...");
  await db.delete(continuitySummaries);
  await db.delete(continuityConsents);
  await db.delete(transitionEvents);
  await db.delete(simulatedEligibility);
  await db.delete(computedSignals);
  await db.delete(consents);
  await db.delete(visits);
  await db.delete(episodes);
  await db.delete(gpPatientNotes);
  await db.delete(patients);
  await db.delete(physiotherapists);
  await db.delete(gps);

  // Insert GPs
  console.log("Creating GPs...");
  for (const gpScenario of gpScenarios) {
    await db.insert(gps).values({
      id: gpScenario.id,
      name: gpScenario.name,
      practiceName: gpScenario.practiceName,
      region: gpScenario.region,
    });
  }
  console.log(`✓ Created ${gpScenarios.length} GPs`);

  // Insert Physiotherapists
  console.log("Creating physiotherapists...");
  for (const physioScenario of physioScenarios) {
    await db.insert(physiotherapists).values({
      id: physioScenario.id,
      name: physioScenario.name,
      email: physioScenario.email,
      clinicName: physioScenario.clinicName,
      region: physioScenario.region,
      specialties: physioScenario.specialties,
      capacity: physioScenario.capacity,
      optedIn: physioScenario.optedIn,
      previewMode: physioScenario.previewMode,
      optedInAt: physioScenario.optedIn ? new Date() : null,
      optedOutAt:
        !physioScenario.optedIn && physioScenario.id === "physio-aisha"
          ? new Date()
          : null,
    });
  }
  console.log(`✓ Created ${physioScenarios.length} physiotherapists`);

  // Generate and insert patients
  console.log("Creating patients...");
  const patientProfiles = generatePatientProfiles(30);
  const patientIds: string[] = [];
  for (let i = 0; i < patientProfiles.length; i++) {
    const profile = patientProfiles[i];
    const patientId = `patient-${i + 1}`;
    patientIds.push(patientId);
    await db.insert(patients).values({
      id: patientId,
      name: profile.name,
      dateOfBirth: profile.dateOfBirth,
      region: profile.region,
    });
  }
  console.log(`✓ Created ${patientProfiles.length} patients`);

  // Insert GP patient notes
  console.log("Creating GP patient notes...");
  for (const noteScenario of gpPatientNoteScenarios) {
    await db.insert(gpPatientNotes).values({
      id: `note-${noteScenario.gpId}-${noteScenario.patientId}`,
      gpId: noteScenario.gpId,
      patientId: noteScenario.patientId,
      notes: noteScenario.notes,
    });
  }
  console.log(`✓ Created ${gpPatientNoteScenarios.length} GP patient notes`);

  // Create episodes and visits for each physio
  console.log("Creating episodes and visits...");
  let totalEpisodes = 0;
  let totalVisits = 0;
  let totalConsents = 0;

  for (const physioScenario of physioScenarios) {
    console.log(`  Processing ${physioScenario.name}...`);
    const baseSeed = process.env.SEED_BASE ?? "kinetic-demo-v1";
    const episodeTemplates = generateEpisodeTemplates(
      physioScenario.expectedSignalProfile,
      physioScenario.episodeCount,
      `${baseSeed}:${physioScenario.id}`
    );
    let grantedConsentsForPhysio = 0;
    const consentTarget =
      physioScenario.id === "physio-sarah"
        ? Math.min(12, physioScenario.episodeCount)
        : Math.max(2, Math.floor(physioScenario.episodeCount * 0.5));

    for (let i = 0; i < episodeTemplates.length; i++) {
      const template = episodeTemplates[i];
      const episodeId = `episode-${physioScenario.id}-${i + 1}`;
      const patientId = patientIds[i % patientIds.length];

      // Determine referring GP (if GP referred)
      const referringGpId = template.isGpReferred
        ? gpScenarios.find((gp) => gp.region === physioScenario.region)?.id ||
          gpScenarios[0].id
        : null;

      // Calculate episode dates
      const daysAgo = (physioScenario.episodeCount - i) * 30; // Spread over months
      const startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const dischargedAt =
        template.status === "discharged" || template.status === "self-discharged"
          ? new Date(
              startedAt.getTime() + template.visitCount * 7 * 24 * 60 * 60 * 1000
            )
          : null;

      // Simulate inbound transfers for strong patient preference profiles
      // ~30% of episodes are "patients who came from another physio"
      // Self-reference earlier episodes to avoid FK ordering issues
      const hasInboundTransfer =
        physioScenario.expectedSignalProfile.patientPreference === "strong" &&
        i % 3 === 0 && i > 0;
      const priorPhysioEpisodeId = hasInboundTransfer
        ? `episode-${physioScenario.id}-${i - 1}` // Reference own earlier episode as prior care
        : null;

      // Insert episode
      await db.insert(episodes).values({
        id: episodeId,
        patientId,
        physioId: physioScenario.id,
        referringGpId,
        condition: template.condition,
        status: template.status,
        startedAt,
        dischargedAt,
        isGpReferred: template.isGpReferred,
        priorPhysioEpisodeId,
      });
      totalEpisodes++;

      // Insert visits for this episode
      for (let v = 0; v < template.visitCount; v++) {
        const visitId = `visit-${episodeId}-${v + 1}`;
        const visitDate = new Date(
          startedAt.getTime() + v * 7 * 24 * 60 * 60 * 1000
        );

        await db.insert(visits).values({
          id: visitId,
          episodeId,
          visitDate,
          visitNumber: v + 1,
          notesSummary: `Visit ${v + 1} for ${template.condition}`,
          escalated: template.escalationVisits.includes(v + 1),
          treatmentAdjusted: template.adjustmentVisits.includes(v + 1),
          painScore: template.painProgression[v],
          functionScore: template.functionProgression[v],
        });
        totalVisits++;
      }

      // Deterministic consent seeding:
      // - Sarah is a "happy path" demo with deep consented data (high-confidence signals)
      // - Other physios keep a moderate amount of consented history
      const shouldGrantConsent =
        grantedConsentsForPhysio < consentTarget &&
        (physioScenario.id === "physio-sarah" || template.isGpReferred);

      if (shouldGrantConsent) {
        const consentId = `consent-${episodeId}`;
        await db.insert(consents).values({
          id: consentId,
          patientId,
          episodeId,
          physioId: physioScenario.id,
          status: "granted",
          grantedAt: startedAt,
          revokedAt: null,
          scope: "episode-data-for-signal-computation",
        });
        totalConsents++;
        grantedConsentsForPhysio++;
      }
    }
  }

  console.log(`✓ Created ${totalEpisodes} episodes`);
  console.log(`✓ Created ${totalVisits} visits`);
  console.log(`✓ Created ${totalConsents} consents`);

  // Create transition scenarios
  console.log("\nCreating transition scenarios...");
  let totalTransitions = 0;

  for (const scenario of transitionScenarios) {
    // Find a suitable origin episode (first GP-referred discharged episode for origin physio)
    const originEpisodeId = `episode-${scenario.originPhysioId}-2`;
    const originEpisodeResult = await db.query.episodes.findFirst({
      where: (ep, { eq }) => eq(ep.id, originEpisodeId),
    });

    if (!originEpisodeResult) {
      console.log(`  Skipping ${scenario.id} — origin episode not found`);
      continue;
    }

    const patientId = originEpisodeResult.patientId;
    const now = new Date();
    const initiatedAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago

    // Create transition event
    await db.insert(transitionEvents).values({
      id: scenario.id,
      patientId,
      originEpisodeId,
      originPhysioId: scenario.originPhysioId,
      destinationPhysioId: scenario.destinationPhysioId,
      referringGpId: scenario.transitionType === "gp-referral" ? "gp-alice" : null,
      transitionType: scenario.transitionType,
      status: scenario.targetStatus,
      initiatedAt,
      completedAt: scenario.targetStatus === "released" ? now : null,
    });

    // Update origin episode status to transferred
    await db
      .update(episodes)
      .set({ status: "transferred" })
      .where(eq(episodes.id, originEpisodeId));

    // For scenarios beyond consent-pending, create consent + summary
    if (scenario.targetStatus !== "consent-pending") {
      // Create continuity consent
      const consentId = `cc-${scenario.id}`;
      await db.insert(continuityConsents).values({
        id: consentId,
        patientId,
        transitionEventId: scenario.id,
        originEpisodeId,
        status: "granted",
        scope: "continuity-summary-for-transition",
        grantedAt: new Date(initiatedAt.getTime() + 1 * 24 * 60 * 60 * 1000),
      });

      // Fetch visits for summary generation
      const episodeVisits = await db.query.visits.findMany({
        where: (v, { eq }) => eq(v.episodeId, originEpisodeId),
        orderBy: (v, { asc }) => [asc(v.visitNumber)],
      });

      const patient = await db.query.patients.findFirst({
        where: (p, { eq }) => eq(p.id, patientId),
      });

      // Generate and store summary
      const summaryContent = generateSummary({
        episode: originEpisodeResult,
        visits: episodeVisits,
        patientName: patient?.name ?? "Unknown",
      });

      const summaryId = `summary-${scenario.id}`;
      const isReleased = scenario.targetStatus === "released";
      const generatedAt = new Date(initiatedAt.getTime() + 1 * 24 * 60 * 60 * 1000);

      await db.insert(continuitySummaries).values({
        id: summaryId,
        transitionEventId: scenario.id,
        originEpisodeId,
        originPhysioId: scenario.originPhysioId,
        patientId,
        conditionFraming: summaryContent.conditionFraming,
        diagnosisHypothesis: summaryContent.diagnosisHypothesis,
        interventionsAttempted: summaryContent.interventionsAttempted,
        responseProfile: summaryContent.responseProfile,
        currentStatus: summaryContent.currentStatus,
        openConsiderations: summaryContent.openConsiderations,
        physioAnnotations: isReleased
          ? "Transferring care as patient is relocating. Good progress overall — continue current approach."
          : null,
        status: isReleased ? "released" : "pending-review",
        generatedAt,
        reviewedAt: isReleased
          ? new Date(generatedAt.getTime() + 2 * 24 * 60 * 60 * 1000)
          : null,
        releasedAt: isReleased
          ? new Date(generatedAt.getTime() + 3 * 24 * 60 * 60 * 1000)
          : null,
      });
    }

    totalTransitions++;
    console.log(`  ✓ ${scenario.description}`);
  }
  console.log(`✓ Created ${totalTransitions} transition scenarios`);

  // Compute signals for all physios so demo profiles always have visible quality data.
  console.log("\nComputing signals for all physiotherapists...");
  const { computeSignalsForPhysio } = await import("../lib/signals/compute");

  for (const scenario of physioScenarios) {
    console.log(`  Computing signals for ${scenario.name}...`);
    await computeSignalsForPhysio(scenario.id);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nScenario summary:");
  for (const scenario of physioScenarios) {
    console.log(
      `  ${scenario.name} (${scenario.id}): ${scenario.optedIn ? "OPTED IN" : "NOT OPTED IN"} - ${scenario.description}`
    );
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
