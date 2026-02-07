"use server";

import { db } from "@/db";
import { physiotherapists } from "@/db/schema";
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
