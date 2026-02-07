"use server";

import { db } from "@/db";
import {
  physiotherapists,
  continuitySummaries,
  continuityConsents,
  transitionEvents,
} from "@/db/schema";
import { revalidatePath } from "next/cache";

/**
 * Development utility: Reset all physiotherapists to not opted in
 * Useful for testing the opt-in flow repeatedly
 */
export async function resetAllPhysiosOptIn() {
  try {
    await db
      .update(physiotherapists)
      .set({
        optedIn: false,
        previewMode: false,
        optedInAt: null,
      });

    // Revalidate all physio pages
    revalidatePath("/physio", "layout");

    return { success: true, message: "All physios reset to not opted in" };
  } catch (error) {
    console.error("Error resetting physios:", error);
    return { success: false, error: "Failed to reset physios" };
  }
}

/**
 * Development utility: Reset all transition data
 * Useful for testing the handoff flow repeatedly
 */
export async function resetAllTransitions() {
  try {
    // Order matters for foreign keys
    await db.delete(continuitySummaries);
    await db.delete(continuityConsents);
    await db.delete(transitionEvents);

    // Revalidate all physio pages
    revalidatePath("/physio", "layout");

    return { success: true, message: "All transitions reset" };
  } catch (error) {
    console.error("Error resetting transitions:", error);
    return { success: false, error: "Failed to reset transitions" };
  }
}
