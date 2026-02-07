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
import { ArrowLeft } from "lucide-react";
import { ContinuitySummaryDisplay } from "@/components/physio/continuity-summary-display";
import { SummaryReviewCard } from "@/components/physio/summary-review-card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string; summaryId: string }>;
}

export default async function SummaryReviewPage({ params }: Props) {
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

  // Access control: only originating physio can review
  if (summary.originPhysioId !== physioId) {
    redirect(`/physio/${physioId}/handoffs`);
  }

  // If already released, redirect to view page
  if (summary.status === "released") {
    redirect(`/physio/${physioId}/handoffs/${summaryId}`);
  }

  // Fetch transition details
  const [transition] = await db
    .select()
    .from(transitionEvents)
    .where(eq(transitionEvents.id, summary.transitionEventId));

  // Fetch patient name
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, summary.patientId));

  // Fetch destination physio name
  let destinationPhysioName = "Unknown";
  if (transition?.destinationPhysioId) {
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
              Review Continuity Summary
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <span>{patient?.name ?? "Unknown"}</span>
              <span>&middot;</span>
              <span>{originEpisode?.condition ?? "Unknown"}</span>
              <span>&middot;</span>
              <span>To {destinationPhysioName}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Generated {formatDate(summary.generatedAt)}</span>
              {summary.reviewedAt && (
                <span>&middot; Reviewed {formatDate(summary.reviewedAt)}</span>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              summary.status === "pending-review"
                ? "border-purple-200 bg-purple-50 text-purple-700"
                : "border-teal-200 bg-teal-50 text-teal-700"
            }
          >
            {summary.status === "pending-review"
              ? "Pending Review"
              : summary.status === "approved"
                ? "Approved"
                : summary.status}
          </Badge>
        </div>
      </div>

      {/* Summary Content */}
      <div className="mb-8">
        <ContinuitySummaryDisplay
          conditionFraming={summary.conditionFraming}
          diagnosisHypothesis={summary.diagnosisHypothesis}
          interventionsAttempted={
            summary.interventionsAttempted as string[]
          }
          responseProfile={
            summary.responseProfile as {
              responded: string[];
              didNotRespond: string[];
            }
          }
          currentStatus={summary.currentStatus}
          openConsiderations={summary.openConsiderations as string[]}
          physioAnnotations={summary.physioAnnotations}
          showAnnotations={false}
        />
      </div>

      {/* Review Card */}
      <SummaryReviewCard
        summaryId={summaryId}
        physioId={physioId}
        summaryStatus={summary.status}
        existingAnnotations={summary.physioAnnotations}
      />
    </div>
  );
}
