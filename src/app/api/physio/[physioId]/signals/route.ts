import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { computedSignals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ physioId: string }> }
) {
  const { physioId } = await params;

  try {
    const signals = await db
      .select()
      .from(computedSignals)
      .where(eq(computedSignals.physioId, physioId));

    const formattedSignals = signals.map((signal) => ({
      type: signal.signalType,
      value: signal.value,
      confidence: signal.confidence,
      episodeCount: signal.episodeCount,
    }));

    return NextResponse.json({ signals: formattedSignals });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}
