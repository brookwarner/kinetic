import { db } from "@/db";
import {
  transitionEvents,
  continuitySummaries,
  patients,
  episodes,
  physiotherapists,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ physioId: string }> }
) {
  const { physioId } = await params;

  // Fetch transitions where physio is origin or destination
  const transitions = await db
    .select({
      transition: transitionEvents,
      patient: patients,
      originEpisode: episodes,
    })
    .from(transitionEvents)
    .leftJoin(patients, eq(transitionEvents.patientId, patients.id))
    .leftJoin(episodes, eq(transitionEvents.originEpisodeId, episodes.id))
    .where(
      or(
        eq(transitionEvents.originPhysioId, physioId),
        eq(transitionEvents.destinationPhysioId, physioId)
      )
    );

  // Enrich with summary status and physio names
  const enriched = await Promise.all(
    transitions.map(async (t) => {
      const [summary] = await db
        .select()
        .from(continuitySummaries)
        .where(eq(continuitySummaries.transitionEventId, t.transition.id));

      const [originPhysio] = await db
        .select({ name: physiotherapists.name })
        .from(physiotherapists)
        .where(eq(physiotherapists.id, t.transition.originPhysioId));

      let destinationPhysio = null;
      if (t.transition.destinationPhysioId) {
        const [dest] = await db
          .select({ name: physiotherapists.name })
          .from(physiotherapists)
          .where(eq(physiotherapists.id, t.transition.destinationPhysioId));
        destinationPhysio = dest ?? null;
      }

      return {
        ...t.transition,
        patientName: t.patient?.name ?? "Unknown",
        condition: t.originEpisode?.condition ?? "Unknown",
        summaryId: summary?.id ?? null,
        summaryStatus: summary?.status ?? null,
        originPhysioName: originPhysio?.name ?? "Unknown",
        destinationPhysioName: destinationPhysio?.name ?? null,
        isOutgoing: t.transition.originPhysioId === physioId,
      };
    })
  );

  return NextResponse.json(enriched);
}
