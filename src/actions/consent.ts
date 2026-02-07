"use server";

import { db } from "@/db";
import { consents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function grantConsent(
  patientId: string,
  episodeId: string,
  physioId: string
) {
  try {
    // Check if consent already exists
    const existing = await db
      .select()
      .from(consents)
      .where(
        and(
          eq(consents.episodeId, episodeId),
          eq(consents.patientId, patientId)
        )
      );

    if (existing.length > 0) {
      // Update existing consent
      await db
        .update(consents)
        .set({
          status: "granted",
          grantedAt: new Date(),
          revokedAt: null,
        })
        .where(eq(consents.id, existing[0].id));
    } else {
      // Create new consent
      await db.insert(consents).values({
        id: `consent-${episodeId}-${Date.now()}`,
        patientId,
        episodeId,
        physioId,
        status: "granted",
        grantedAt: new Date(),
        revokedAt: null,
        scope: "episode-data-for-signal-computation",
      });
    }

    // Revalidate relevant pages
    revalidatePath(`/physio/${physioId}/episodes/${episodeId}`);
    revalidatePath(`/patient/${patientId}/consent`);

    return { success: true };
  } catch (error) {
    console.error("Error granting consent:", error);
    return { success: false, error: "Failed to grant consent" };
  }
}

export async function revokeConsent(consentId: string, physioId: string, episodeId: string) {
  try {
    await db
      .update(consents)
      .set({
        status: "revoked",
        revokedAt: new Date(),
      })
      .where(eq(consents.id, consentId));

    // Revalidate relevant pages
    revalidatePath(`/physio/${physioId}/episodes/${episodeId}`);

    // In a real system, this would trigger signal recomputation
    console.log(`Consent ${consentId} revoked - signals should be recomputed`);

    return { success: true };
  } catch (error) {
    console.error("Error revoking consent:", error);
    return { success: false, error: "Failed to revoke consent" };
  }
}
