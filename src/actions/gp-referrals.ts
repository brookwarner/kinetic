"use server";

import { db } from "@/db";
import { episodes, transitionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGpReferral({
  gpId,
  patientId,
  destinationPhysioId,
  condition,
  originEpisodeId,
}: {
  gpId: string;
  patientId: string;
  destinationPhysioId: string;
  condition: string;
  originEpisodeId?: string;
}) {
  try {
    // Create new episode for the destination physio
    const newEpisodeId = `episode-gp-ref-${Date.now()}`;
    await db.insert(episodes).values({
      id: newEpisodeId,
      patientId,
      physioId: destinationPhysioId,
      referringGpId: gpId,
      condition,
      status: "active",
      startedAt: new Date(),
      isGpReferred: true,
      priorPhysioEpisodeId: originEpisodeId ?? null,
    });

    // If there's a prior episode, create a transition event
    if (originEpisodeId) {
      const [originEpisode] = await db
        .select()
        .from(episodes)
        .where(eq(episodes.id, originEpisodeId));

      if (originEpisode) {
        const transitionId = `transition-gp-ref-${Date.now()}`;
        await db.insert(transitionEvents).values({
          id: transitionId,
          patientId,
          originEpisodeId,
          originPhysioId: originEpisode.physioId,
          destinationEpisodeId: newEpisodeId,
          destinationPhysioId,
          referringGpId: gpId,
          transitionType: "gp-referral",
          status: "consent-pending",
          initiatedAt: new Date(),
        });

        revalidatePath(`/physio/${originEpisode.physioId}/handoffs`);
      }
    }

    revalidatePath(`/physio/${destinationPhysioId}/episodes`);
    revalidatePath(`/physio/${destinationPhysioId}/eligibility`);
    revalidatePath(`/gp/${gpId}`);

    return { success: true, episodeId: newEpisodeId };
  } catch (error) {
    console.error("Error creating GP referral:", error);
    return { success: false, error: "Failed to create GP referral" };
  }
}
