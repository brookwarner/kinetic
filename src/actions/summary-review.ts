"use server";

import { db } from "@/db";
import { continuitySummaries, transitionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveSummary(
  summaryId: string,
  physioAnnotations?: string
) {
  try {
    const [summary] = await db
      .select()
      .from(continuitySummaries)
      .where(eq(continuitySummaries.id, summaryId));

    if (!summary) {
      return { success: false, error: "Summary not found" };
    }

    if (summary.status !== "pending-review") {
      return { success: false, error: "Summary is not in pending-review status" };
    }

    await db
      .update(continuitySummaries)
      .set({
        status: "approved",
        physioAnnotations: physioAnnotations || null,
        reviewedAt: new Date(),
      })
      .where(eq(continuitySummaries.id, summaryId));

    revalidatePath(`/physio/${summary.originPhysioId}/handoffs`);
    revalidatePath(`/physio/${summary.originPhysioId}/handoffs/${summaryId}/review`);

    return { success: true };
  } catch (error) {
    console.error("Error approving summary:", error);
    return { success: false, error: "Failed to approve summary" };
  }
}

export async function releaseSummary(summaryId: string) {
  try {
    const [summary] = await db
      .select()
      .from(continuitySummaries)
      .where(eq(continuitySummaries.id, summaryId));

    if (!summary) {
      return { success: false, error: "Summary not found" };
    }

    if (summary.status !== "approved" && summary.status !== "pending-review") {
      return { success: false, error: "Summary must be approved before release" };
    }

    // If still pending-review, approve first
    const now = new Date();
    await db
      .update(continuitySummaries)
      .set({
        status: "released",
        reviewedAt: summary.reviewedAt ?? now,
        releasedAt: now,
      })
      .where(eq(continuitySummaries.id, summaryId));

    // Update transition to released
    await db
      .update(transitionEvents)
      .set({
        status: "released",
        completedAt: now,
      })
      .where(eq(transitionEvents.id, summary.transitionEventId));

    // Fetch transition to get destination physio
    const [transition] = await db
      .select()
      .from(transitionEvents)
      .where(eq(transitionEvents.id, summary.transitionEventId));

    revalidatePath(`/physio/${summary.originPhysioId}/handoffs`);
    if (transition?.destinationPhysioId) {
      revalidatePath(`/physio/${transition.destinationPhysioId}/handoffs`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error releasing summary:", error);
    return { success: false, error: "Failed to release summary" };
  }
}
