"use server";

import { db } from "@/db";
import { physiotherapists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleOptIn(physioId: string, optIn: boolean) {
  // Update the physiotherapist's opt-in status
  await db
    .update(physiotherapists)
    .set({
      optedIn: optIn,
      previewMode: optIn ? true : false, // Enable preview mode when opting in
      optedInAt: optIn ? new Date() : null,
      optedOutAt: optIn ? null : new Date(),
    })
    .where(eq(physiotherapists.id, physioId));

  // If opting out, we don't delete data - it just becomes inactive
  // The system will exclude this physio from signal computation and eligibility

  // Only revalidate when opting OUT
  // When opting in, the wizard handles its own flow and navigation without triggering page re-renders
  if (!optIn) {
    revalidatePath(`/physio/${physioId}`);
    revalidatePath(`/physio/${physioId}/opt-in`);
  }

  return { success: true };
}

export async function disablePreviewMode(physioId: string) {
  try {
    await db
      .update(physiotherapists)
      .set({
        previewMode: false,
      })
      .where(eq(physiotherapists.id, physioId));

    revalidatePath(`/physio/${physioId}`);
    revalidatePath(`/physio/${physioId}/signals`);

    return { success: true };
  } catch (error) {
    console.error("Error disabling preview mode:", error);
    return { success: false, error: "Failed to disable preview mode" };
  }
}
