import { db } from "@/db";
import {
  physiotherapists,
  transitionEvents,
  continuitySummaries,
  patients,
  episodes,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRightLeft,
  ArrowRight,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/physio/page-header";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
}

function statusBadge(status: string) {
  const variants: Record<string, { label: string; className: string }> = {
    "consent-pending": {
      label: "Awaiting Consent",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    "summary-pending": {
      label: "Generating Summary",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    "review-pending": {
      label: "Pending Review",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    released: {
      label: "Released",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    declined: {
      label: "Declined",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    expired: {
      label: "Expired",
      className: "bg-slate-50 text-slate-700 border-slate-200",
    },
    initiated: {
      label: "Initiated",
      className: "bg-slate-50 text-slate-700 border-slate-200",
    },
  };

  const v = variants[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <Badge variant="outline" className={v.className}>
      {v.label}
    </Badge>
  );
}

function transitionTypeBadge(type: string) {
  const labels: Record<string, string> = {
    "gp-referral": "GP Referral",
    "patient-booking": "Patient Booking",
    "physio-handoff": "Physio Handoff",
  };
  return (
    <Badge variant="secondary" className="text-xs">
      {labels[type] ?? type}
    </Badge>
  );
}

export default async function HandoffsPage({ params }: Props) {
  const { physioId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // Fetch all transitions involving this physio
  const allTransitions = await db
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

  // Enrich with summary data and physio names
  const enrichedTransitions = await Promise.all(
    allTransitions.map(async (t) => {
      const [summary] = await db
        .select()
        .from(continuitySummaries)
        .where(
          eq(continuitySummaries.transitionEventId, t.transition.id)
        );

      // Get the other physio's name
      let otherPhysioName = "Unknown";
      const isOutgoing = t.transition.originPhysioId === physioId;
      const otherPhysioId = isOutgoing
        ? t.transition.destinationPhysioId
        : t.transition.originPhysioId;

      if (otherPhysioId) {
        const [other] = await db
          .select({ name: physiotherapists.name })
          .from(physiotherapists)
          .where(eq(physiotherapists.id, otherPhysioId));
        otherPhysioName = other?.name ?? "Unknown";
      }

      return {
        ...t.transition,
        patientName: t.patient?.name ?? "Unknown",
        condition: t.originEpisode?.condition ?? "Unknown",
        summaryId: summary?.id ?? null,
        summaryStatus: summary?.status ?? null,
        otherPhysioName,
        isOutgoing,
      };
    })
  );

  const outgoing = enrichedTransitions.filter((t) => t.isOutgoing);
  const incoming = enrichedTransitions.filter((t) => !t.isOutgoing);

  const outgoingCount = outgoing.length;
  const incomingCount = incoming.length;

  return (
    <div className="px-6 py-8">
      <PageHeader
        physioName={physio.name}
        physioId={physioId}
        previewMode={physio.previewMode}
        title="Care Handoffs"
        description={`${outgoingCount} outgoing, ${incomingCount} incoming transition${outgoingCount + incomingCount !== 1 ? "s" : ""}`}
      />

      {/* Outgoing Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Outgoing Handoffs ({outgoingCount})
        </h2>
        {outgoing.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Inbox className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                No outgoing handoffs
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Handoffs you initiate will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {outgoing.map((t) => (
              <Card
                key={t.id}
                className="border-l-4 border-l-teal-400 transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {t.condition}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {t.patientName} &middot; To{" "}
                        <span className="font-medium">
                          {t.otherPhysioName}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {transitionTypeBadge(t.transitionType)}
                      {statusBadge(t.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Initiated {formatDate(t.initiatedAt)}
                      </span>
                      {t.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed {formatDate(t.completedAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {t.summaryId && (
                        <>
                          {(t.summaryStatus === "pending-review" ||
                            t.summaryStatus === "approved") && (
                            <Link
                              href={`/physio/${physioId}/handoffs/${t.summaryId}/review`}
                            >
                              <Button
                                size="sm"
                                className="bg-teal-600 text-white hover:bg-teal-700"
                              >
                                <FileText className="mr-2 h-3.5 w-3.5" />
                                Review
                              </Button>
                            </Link>
                          )}
                          {t.summaryStatus === "released" && (
                            <Link
                              href={`/physio/${physioId}/handoffs/${t.summaryId}`}
                            >
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                View
                              </Button>
                            </Link>
                          )}
                        </>
                      )}

                      {t.status === "consent-pending" && (
                        <Link
                          href={`/patient/${t.patientId}/consent?transition=${t.id}`}
                        >
                          <Button variant="outline" size="sm">
                            Patient Consent
                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Incoming Handoffs ({incomingCount})
        </h2>
        {incoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Inbox className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                No incoming handoffs
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Summaries shared with you will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incoming.map((t) => (
              <Card
                key={t.id}
                className="border-l-4 border-l-purple-400 transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {t.condition}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {t.patientName} &middot; From{" "}
                        <span className="font-medium">
                          {t.otherPhysioName}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {transitionTypeBadge(t.transitionType)}
                      {statusBadge(t.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Initiated {formatDate(t.initiatedAt)}
                      </span>
                      {t.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed {formatDate(t.completedAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {t.summaryId && t.summaryStatus === "released" && (
                        <Link
                          href={`/physio/${physioId}/handoffs/${t.summaryId}`}
                        >
                          <Button
                            size="sm"
                            className="bg-teal-600 text-white hover:bg-teal-700"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            View Summary
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
