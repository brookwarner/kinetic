import { db } from "@/db";
import {
  physiotherapists,
  continuitySummaries,
  transitionEvents,
  patients,
  episodes,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { ContinuitySummaryDisplay } from "@/components/physio/continuity-summary-display";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string; summaryId: string }>;
}

export default async function SummaryViewPage({ params }: Props) {
  const { physioId, summaryId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  const [summary] = await db
    .select()
    .from(continuitySummaries)
    .where(eq(continuitySummaries.id, summaryId));

  if (!summary) {
    notFound();
  }

  // Fetch transition for access control
  const [transition] = await db
    .select()
    .from(transitionEvents)
    .where(eq(transitionEvents.id, summary.transitionEventId));

  // Access control
  const isOriginPhysio = summary.originPhysioId === physioId;
  const isDestinationPhysio = transition?.destinationPhysioId === physioId;

  if (!isOriginPhysio && !isDestinationPhysio) {
    redirect(`/physio/${physioId}/handoffs`);
  }

  // Receiving physio can only see released summaries
  if (isDestinationPhysio && summary.status !== "released") {
    redirect(`/physio/${physioId}/handoffs`);
  }

  // Fetch patient name
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, summary.patientId));

  // Fetch both physio names
  let originPhysioName = physio.name;
  let destinationPhysioName = "Unknown";

  if (isDestinationPhysio) {
    const [origin] = await db
      .select({ name: physiotherapists.name })
      .from(physiotherapists)
      .where(eq(physiotherapists.id, summary.originPhysioId));
    originPhysioName = origin?.name ?? "Unknown";
    destinationPhysioName = physio.name;
  } else if (transition?.destinationPhysioId) {
    const [dest] = await db
      .select({ name: physiotherapists.name })
      .from(physiotherapists)
      .where(eq(physiotherapists.id, transition.destinationPhysioId));
    destinationPhysioName = dest?.name ?? "Unknown";
  }

  // Fetch origin episode for condition
  const [originEpisode] = await db
    .select()
    .from(episodes)
    .where(eq(episodes.id, summary.originEpisodeId));

  return (
    <div className="px-6 py-8">
      <Link href={`/physio/${physioId}/handoffs`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Handoffs
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
              Continuity Summary
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <span>{patient?.name ?? "Unknown"}</span>
              <span>&middot;</span>
              <span>{originEpisode?.condition ?? "Unknown"}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <span>From {originPhysioName}</span>
              <span>&rarr;</span>
              <span>To {destinationPhysioName}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span>Generated {formatDate(summary.generatedAt)}</span>
              {summary.reviewedAt && (
                <span>&middot; Reviewed {formatDate(summary.reviewedAt)}</span>
              )}
              {summary.releasedAt && (
                <span>&middot; Released {formatDate(summary.releasedAt)}</span>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            Released
          </Badge>
        </div>
      </div>

      {/* Read-only notice for receiving physio */}
      {isDestinationPhysio && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
          <div className="text-sm text-teal-800">
            <p className="font-medium">Read-only view</p>
            <p className="mt-0.5">
              This summary was generated and reviewed by {originPhysioName}.
              It contains structured clinical data from the patient's prior
              episode to support continuity of care.
            </p>
          </div>
        </div>
      )}

      {/* Summary Content */}
      <ContinuitySummaryDisplay
        conditionFraming={summary.conditionFraming}
        diagnosisHypothesis={summary.diagnosisHypothesis}
        interventionsAttempted={summary.interventionsAttempted as string[]}
        responseProfile={
          summary.responseProfile as {
            responded: string[];
            didNotRespond: string[];
          }
        }
        currentStatus={summary.currentStatus}
        openConsiderations={summary.openConsiderations as string[]}
        physioAnnotations={summary.physioAnnotations}
      />
    </div>
  );
}
