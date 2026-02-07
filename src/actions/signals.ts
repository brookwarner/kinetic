"use server";

import { computeSignalsForPhysio } from "@/lib/signals/compute";
import { revalidatePath } from "next/cache";

export async function recomputeSignals(physioId: string) {
  try {
    await computeSignalsForPhysio(physioId);

    // Revalidate relevant pages
    revalidatePath(`/physio/${physioId}/signals`);
    revalidatePath(`/physio/${physioId}`);

    return { success: true };
  } catch (error) {
    console.error("Error recomputing signals:", error);
    return { success: false, error: "Failed to recompute signals" };
  }
}
