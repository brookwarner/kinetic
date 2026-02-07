import { db } from "@/db";
import { continuitySummaries, transitionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ physioId: string; summaryId: string }> }
) {
  const { physioId, summaryId } = await params;

  const [summary] = await db
    .select()
    .from(continuitySummaries)
    .where(eq(continuitySummaries.id, summaryId));

  if (!summary) {
    return NextResponse.json({ error: "Summary not found" }, { status: 404 });
  }

  // Fetch transition for destination check
  const [transition] = await db
    .select()
    .from(transitionEvents)
    .where(eq(transitionEvents.id, summary.transitionEventId));

  // Access control:
  // - Originating physio: full access always
  // - Destination physio: only if summary is released
  const isOriginPhysio = summary.originPhysioId === physioId;
  const isDestinationPhysio = transition?.destinationPhysioId === physioId;

  if (!isOriginPhysio && !isDestinationPhysio) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (isDestinationPhysio && summary.status !== "released") {
    return NextResponse.json(
      { error: "Summary not yet released" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ...summary,
    accessLevel: isOriginPhysio ? "full" : "read-only",
  });
}
