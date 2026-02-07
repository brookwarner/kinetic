import { NextRequest, NextResponse } from "next/server";
import { simulateEligibility } from "@/lib/eligibility/simulate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ physioId: string }> }
) {
  const { physioId } = await params;

  try {
    const eligibility = await simulateEligibility(physioId);
    return NextResponse.json(eligibility);
  } catch (error) {
    console.error("Error simulating eligibility:", error);
    return NextResponse.json(
      { error: "Failed to simulate eligibility" },
      { status: 500 }
    );
  }
}
