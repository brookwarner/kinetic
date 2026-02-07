import { db } from "./index";
import {
  physiotherapists,
  patients,
  gps,
  episodes,
  visits,
  consents,
  computedSignals,
  simulatedEligibility,
  gpPatientNotes,
} from "./schema";
import {
  physioScenarios,
  gpScenarios,
  gpPatientNoteScenarios,
  generatePatientProfiles,
  generateEpisodeTemplates,
} from "./seed-scenarios";

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data (order matters for foreign keys)
  console.log("Clearing existing data...");
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
    const episodeTemplates = generateEpisodeTemplates(
      physioScenario.expectedSignalProfile,
      physioScenario.episodeCount
    );

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
        priorPhysioEpisodeId: null,
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

      // Insert consent (60% granted for GP-referred episodes, regardless of opt-in status)
      // This allows testing the opt-in flow with pre-existing consents
      if (template.isGpReferred && Math.random() > 0.4) {
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
      }
    }
  }

  console.log(`✓ Created ${totalEpisodes} episodes`);
  console.log(`✓ Created ${totalVisits} visits`);
  console.log(`✓ Created ${totalConsents} consents`);

  // Compute signals for opted-in physios
  console.log("\nComputing signals for opted-in physiotherapists...");
  const { computeSignalsForPhysio } = await import("../lib/signals/compute");

  for (const scenario of physioScenarios) {
    if (scenario.optedIn) {
      console.log(`  Computing signals for ${scenario.name}...`);
      await computeSignalsForPhysio(scenario.id);
    }
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
