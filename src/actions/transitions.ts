"use server";

import { db } from "@/db";
import {
  transitionEvents,
  continuityConsents,
  continuitySummaries,
  episodes,
  visits,
  patients,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateSummary } from "@/lib/continuity/generate-summary";

export async function initiateTransition({
  originEpisodeId,
  transitionType,
  destinationPhysioId,
  referringGpId,
}: {
  originEpisodeId: string;
  transitionType: "gp-referral" | "patient-booking" | "physio-handoff";
  destinationPhysioId?: string;
  referringGpId?: string;
}) {
  try {
    // Fetch origin episode
    const [originEpisode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, originEpisodeId));

    if (!originEpisode) {
      return { success: false, error: "Origin episode not found" };
    }

    const transitionId = `transition-${originEpisodeId}-${Date.now()}`;

    await db.insert(transitionEvents).values({
      id: transitionId,
      patientId: originEpisode.patientId,
      originEpisodeId,
      originPhysioId: originEpisode.physioId,
      destinationPhysioId: destinationPhysioId ?? null,
      referringGpId: referringGpId ?? null,
      transitionType,
      status: "consent-pending",
      initiatedAt: new Date(),
    });

    // Update origin episode status to transferred
    await db
      .update(episodes)
      .set({ status: "transferred" })
      .where(eq(episodes.id, originEpisodeId));

    revalidatePath(`/physio/${originEpisode.physioId}/handoffs`);
    revalidatePath(`/physio/${originEpisode.physioId}/episodes`);
    if (destinationPhysioId) {
      revalidatePath(`/physio/${destinationPhysioId}/handoffs`);
    }

    return { success: true, transitionId };
  } catch (error) {
    console.error("Error initiating transition:", error);
    return { success: false, error: "Failed to initiate transition" };
  }
}

export async function grantContinuityConsent(
  patientId: string,
  transitionEventId: string,
  originEpisodeId: string
) {
  try {
    // Create consent record
    const consentId = `cc-${transitionEventId}-${Date.now()}`;
    await db.insert(continuityConsents).values({
      id: consentId,
      patientId,
      transitionEventId,
      originEpisodeId,
      status: "granted",
      scope: "continuity-summary-for-transition",
      grantedAt: new Date(),
    });

    // Advance transition to summary-pending
    await db
      .update(transitionEvents)
      .set({ status: "summary-pending" })
      .where(eq(transitionEvents.id, transitionEventId));

    // Fetch episode + visits + patient for summary generation
    const [episode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, originEpisodeId));

    const episodeVisits = await db
      .select()
      .from(visits)
      .where(eq(visits.episodeId, originEpisodeId))
      .orderBy(visits.visitNumber);

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId));

    if (!episode || !patient) {
      return { success: false, error: "Episode or patient not found" };
    }

    // Generate summary
    const summaryContent = generateSummary({
      episode,
      visits: episodeVisits,
      patientName: patient.name,
    });

    const summaryId = `summary-${transitionEventId}-${Date.now()}`;
    await db.insert(continuitySummaries).values({
      id: summaryId,
      transitionEventId,
      originEpisodeId,
      originPhysioId: episode.physioId,
      patientId,
      conditionFraming: summaryContent.conditionFraming,
      diagnosisHypothesis: summaryContent.diagnosisHypothesis,
      interventionsAttempted: summaryContent.interventionsAttempted,
      responseProfile: summaryContent.responseProfile,
      currentStatus: summaryContent.currentStatus,
      openConsiderations: summaryContent.openConsiderations,
      status: "pending-review",
      generatedAt: new Date(),
    });

    // Advance transition to review-pending
    await db
      .update(transitionEvents)
      .set({ status: "review-pending" })
      .where(eq(transitionEvents.id, transitionEventId));

    revalidatePath(`/physio/${episode.physioId}/handoffs`);

    return { success: true, summaryId };
  } catch (error) {
    console.error("Error granting continuity consent:", error);
    return { success: false, error: "Failed to grant continuity consent" };
  }
}

export async function revokeContinuityConsent(consentId: string) {
  try {
    const [consent] = await db
      .select()
      .from(continuityConsents)
      .where(eq(continuityConsents.id, consentId));

    if (!consent) {
      return { success: false, error: "Consent not found" };
    }

    // Revoke consent
    await db
      .update(continuityConsents)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(eq(continuityConsents.id, consentId));

    // Revoke any associated summary
    const [summary] = await db
      .select()
      .from(continuitySummaries)
      .where(eq(continuitySummaries.transitionEventId, consent.transitionEventId));

    if (summary) {
      await db
        .update(continuitySummaries)
        .set({ status: "revoked", revokedAt: new Date() })
        .where(eq(continuitySummaries.id, summary.id));

      revalidatePath(`/physio/${summary.originPhysioId}/handoffs`);
    }

    // Update transition status to declined
    await db
      .update(transitionEvents)
      .set({ status: "declined" })
      .where(eq(transitionEvents.id, consent.transitionEventId));

    const [transition] = await db
      .select()
      .from(transitionEvents)
      .where(eq(transitionEvents.id, consent.transitionEventId));

    if (transition?.destinationPhysioId) {
      revalidatePath(`/physio/${transition.destinationPhysioId}/handoffs`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error revoking continuity consent:", error);
    return { success: false, error: "Failed to revoke continuity consent" };
  }
}
