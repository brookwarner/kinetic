import { db } from "@/db";
import { physiotherapists, computedSignals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshCw, Sparkles } from "lucide-react";
import { SignalCard } from "@/components/physio/signal-card";
import { PageHeader } from "@/components/physio/page-header";
import { getBenchmarkSignals, getBenchmarkForSignalType } from "@/lib/signals/benchmark-data";
import { BenchmarkDetailPanel } from "@/components/physio/benchmark-detail-panel";
import { recomputeSignals } from "@/actions/signals";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
}

async function RecomputeButton({ physioId }: { physioId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await recomputeSignals(physioId);
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Recompute Signals
      </Button>
    </form>
  );
}

export default async function SignalsPage({ params }: Props) {
  const { physioId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  if (!physio.optedIn) {
    return (
      <div className="px-6 py-8">
        <PageHeader
          physioName={physio.name}
          physioId={physioId}
          previewMode={physio.previewMode}
          title="Quality Signals"
          description="Unlock transparent quality insights from your patient data"
        />

        <Card className="border-2 border-[hsl(var(--kinetic-wine)/0.2)] bg-gradient-to-br from-[hsl(var(--kinetic-peach))] to-white">
          <CardHeader>
            <CardTitle className="text-2xl text-[hsl(var(--kinetic-wine))]">
              See Your Quality Signals
            </CardTitle>
            <CardDescription className="text-base">
              Understand how your clinical practice translates into quality
              indicators that GPs trust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You'll See */}
            <div className="rounded-lg bg-white/80 p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                What You'll Discover:
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Outcome Trajectory
                    </p>
                    <p className="text-sm text-slate-600">
                      See how patient pain reduction, functional improvements,
                      and appropriate discharge patterns reflect your clinical
                      effectiveness
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Clinical Decision Quality
                    </p>
                    <p className="text-sm text-slate-600">
                      Understand your escalation timing, treatment adjustments,
                      and how you respond to plateaus or setbacks
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <svg
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Patient Preference
                    </p>
                    <p className="text-sm text-slate-600">
                      Track inbound transfers and treatment completion rates
                      that show patients choose to stay with you
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Why This Matters
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                These signals are computed from your consented patient episodes
                and shown to GPs as <strong>directional indicators</strong> (not
                numeric scores). Preview mode lets you verify the computations
                with full transparency before going live. GPs use these signals
                to make confident referrals to physiotherapists whose outcomes
                they can trust.
              </p>
            </div>

            {/* CTA */}
            <Link href={`/physio/${physioId}/opt-in`}>
              <Button
                size="lg"
                className="btn-kinetic w-full text-white"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Compute My Signals
              </Button>
            </Link>

            <p className="text-center text-xs text-slate-500">
              Start in preview mode • Verify signals before going live • Opt
              out anytime
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch computed signals
  const signals = await db
    .select()
    .from(computedSignals)
    .where(eq(computedSignals.physioId, physioId));

  const outcomeSignal = signals.find(
    (s) => s.signalType === "outcome-trajectory"
  );
  const clinicalSignal = signals.find(
    (s) => s.signalType === "clinical-decision"
  );
  const preferenceSignal = signals.find(
    (s) => s.signalType === "patient-preference"
  );

  const benchmarkData = getBenchmarkSignals(physioId);

  return (
    <div className="px-6 py-8">
      <PageHeader
        physioName={physio.name}
        physioId={physioId}
        previewMode={physio.previewMode}
        title="Quality Signals"
        description="Directional indicators from your consented episodes"
        actions={<RecomputeButton physioId={physioId} />}
      />

      {signals.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Signals Computed Yet</CardTitle>
            <CardDescription>
              Signals will be computed once you have episodes with patient
              consent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecomputeButton physioId={physioId} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Signal Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {outcomeSignal && (
              <SignalCard
                title="Outcome Trajectory"
                description="Patient outcomes and functional improvements"
                value={outcomeSignal.value}
                confidence={outcomeSignal.confidence}
                episodeCount={outcomeSignal.episodeCount}
                benchmarkSummary={getBenchmarkForSignalType(physioId, "outcome-trajectory") ?? undefined}
              />
            )}

            {clinicalSignal && (
              <SignalCard
                title="Clinical Decision Quality"
                description="Escalation timing and treatment adjustments"
                value={clinicalSignal.value}
                confidence={clinicalSignal.confidence}
                episodeCount={clinicalSignal.episodeCount}
                benchmarkSummary={getBenchmarkForSignalType(physioId, "clinical-decision") ?? undefined}
              />
            )}

            {preferenceSignal && (
              <SignalCard
                title="Patient Preference"
                description="Inbound transfers and treatment completion"
                value={preferenceSignal.value}
                confidence={preferenceSignal.confidence}
                episodeCount={preferenceSignal.episodeCount}
                benchmarkSummary={getBenchmarkForSignalType(physioId, "patient-preference") ?? undefined}
              />
            )}
          </div>

          {/* Benchmark Analysis Section */}
          {benchmarkData && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
                  Benchmark Analysis
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  AI-powered comparison against industry and peer benchmarks
                </p>
              </div>
              <BenchmarkDetailPanel
                data={benchmarkData}
                defaultExpanded={physio.previewMode}
              />
            </div>
          )}

          {/* Signal Details (Preview Mode) */}
          {physio.previewMode && (
            <>
            <Card>
              <CardHeader>
                <CardTitle>Technical Details (Preview Mode)</CardTitle>
                <CardDescription>
                  Detailed breakdown of how signals are computed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {outcomeSignal && (
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Outcome Trajectory Details
                    </h3>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Avg Pain Reduction:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (outcomeSignal.details as any).avgPainReduction *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Avg Function Improvement:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (outcomeSignal.details as any)
                              .avgFunctionImprovement * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Visit Frequency Tapering:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (outcomeSignal.details as any)
                              .visitFrequencyTapering * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Appropriate Discharge:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (outcomeSignal.details as any)
                              .appropriateDischarge * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Last computed: {formatDateTime(outcomeSignal.computedAt)}
                    </p>
                  </div>
                )}

                {clinicalSignal && (
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Clinical Decision Details
                    </h3>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Escalation Rate:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (clinicalSignal.details as any).escalationRate * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Appropriate Escalation Timing:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (clinicalSignal.details as any)
                              .appropriateEscalationTiming * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Treatment Adjustment Responsiveness:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (clinicalSignal.details as any)
                              .treatmentAdjustmentResponsiveness * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Last computed: {formatDateTime(clinicalSignal.computedAt)}
                    </p>
                  </div>
                )}

                {preferenceSignal && (
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Patient Preference Details
                    </h3>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Inbound Transfer Rate:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (preferenceSignal.details as any)
                              .inboundTransferRate * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Successful Handoff Rate:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (preferenceSignal.details as any)
                              .successfulHandoffRate * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-slate-600">
                          Retention Indicator:
                        </span>
                        <span className="font-medium tabular-nums">
                          {Math.round(
                            (preferenceSignal.details as any)
                              .retentionIndicator * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Last computed:{" "}
                      {formatDateTime(preferenceSignal.computedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {benchmarkData && (
              <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--kinetic-wine))]" />
                    Benchmark Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p>
                    Kinetic AI analyses structured clinical data and treatment notes
                    from your consented episodes using natural language processing
                    to extract patterns in treatment decisions, patient progress,
                    and clinical outcomes.
                  </p>
                  <p>
                    Benchmarks are derived from anonymised, aggregated data across
                    the Kinetic network. All comparisons use risk-adjusted
                    methodologies that account for patient complexity, condition
                    severity, and regional factors.
                  </p>
                </CardContent>
              </Card>
            )}
            </>
          )}

          {/* Important Note */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-blue-900">
                Important: Numeric values shown in preview mode are for
                transparency only
              </p>
              <p className="mt-1 text-sm text-blue-800">
                GPs never see numeric scores. They only see directional
                indicators (positive trend, emerging, needs data) and confidence
                levels. This prevents gaming and focuses on quality patterns,
                not rankings.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

