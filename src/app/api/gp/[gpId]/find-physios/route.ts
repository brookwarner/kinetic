import { db } from "@/db";
import { gps, physiotherapists, computedSignals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SignalData {
  type: string;
  value: number;
  confidence: "low" | "medium" | "high";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gpId: string }> }
) {
  const { gpId } = await params;
  const body = await request.json();
  const { patientRegion } = body;

  // Verify GP exists
  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    return NextResponse.json({ error: "GP not found" }, { status: 404 });
  }

  // Use patient's region if provided, otherwise use GP's region
  const targetRegion = patientRegion || gp.region;

  // Get all opted-in physiotherapists (not in preview mode) from the target region
  // Also include physios from other regions for demo purposes (with region indicator)
  const allPhysios = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.optedIn, true));

  // Filter: only those not in preview mode
  const eligiblePhysios = allPhysios.filter((p) => !p.previewMode);

  // Get signals for all eligible physios
  const physioIds = eligiblePhysios.map((p) => p.id);

  const signals = await db
    .select()
    .from(computedSignals)
    .where(
      physioIds.length > 0
        ? eq(computedSignals.physioId, physioIds[0]) // Will need to filter in code
        : eq(computedSignals.physioId, "none")
    );

  // Get all signals and group by physio
  const allSignals = physioIds.length > 0
    ? await db.select().from(computedSignals)
    : [];

  const signalsByPhysio = new Map<string, SignalData[]>();
  for (const signal of allSignals) {
    if (!signalsByPhysio.has(signal.physioId)) {
      signalsByPhysio.set(signal.physioId, []);
    }
    signalsByPhysio.get(signal.physioId)!.push({
      type: signal.signalType,
      value: signal.value,
      confidence: signal.confidence,
    });
  }

  // Build response with physio details
  const physiosWithDetails = eligiblePhysios.map((physio) => ({
    id: physio.id,
    name: physio.name,
    clinicName: physio.clinicName,
    region: physio.region,
    capacity: physio.capacity,
    specialties: physio.specialties,
    sameRegion: physio.region === targetRegion,
    signals: signalsByPhysio.get(physio.id) || [],
  }));

  // Sort: same region first, then by capacity (available > limited > waitlist)
  const capacityOrder = { available: 0, limited: 1, waitlist: 2 };
  physiosWithDetails.sort((a, b) => {
    // Same region first
    if (a.sameRegion && !b.sameRegion) return -1;
    if (!a.sameRegion && b.sameRegion) return 1;
    // Then by capacity
    return capacityOrder[a.capacity] - capacityOrder[b.capacity];
  });

  // Limit to top 5 for display
  const topPhysios = physiosWithDetails.slice(0, 5);

  return NextResponse.json({ physios: topPhysios });
}
