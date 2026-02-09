"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SignalCard } from "@/components/physio/signal-card";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { toggleOptIn, disablePreviewMode } from "@/actions/opt-in";
import { recomputeSignals } from "@/actions/signals";
import { cn } from "@/lib/utils";
import { getBenchmarkSignals, getBenchmarkForSignalType } from "@/lib/signals/benchmark-data";
import { BenchmarkDetailPanel } from "@/components/physio/benchmark-detail-panel";

interface ConsentedEpisode {
  id: string;
  condition: string;
  patientIndex: number;
}

interface SignalData {
  type: string;
  value: number;
  confidence: "low" | "medium" | "high";
  episodeCount: number;
}

interface EligibilityData {
  eligibleReferralSets: number;
  totalReferralSets: number;
  confidenceFactors: {
    regionMatch: boolean;
    signalsComputed: boolean;
    outcomeTrajectoryStrong: boolean;
    clinicalDecisionStrong: boolean;
    patientPreferenceStrong: boolean;
  };
}

type WizardStep = "consent" | "analysing" | "results" | "go-live";

interface OptInWizardProps {
  physioId: string;
}

export function OptInWizard({ physioId }: OptInWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("consent");
  const [isOptingIn, setIsOptingIn] = useState(false);
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);

  // Consent step data
  const [consentedEpisodes, setConsentedEpisodes] = useState<ConsentedEpisode[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);

  // Analysis step data
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");

  // Results step data
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);

  // Load consented episodes on mount
  useEffect(() => {
    async function loadConsentedEpisodes() {
      try {
        const res = await fetch(`/api/physio/${physioId}/consented-episodes`);
        if (res.ok) {
          const data = await res.json();
          setConsentedEpisodes(data.episodes);
        }
      } catch (error) {
        console.error("Error loading consented episodes:", error);
      } finally {
        setIsLoadingConsents(false);
      }
    }

    loadConsentedEpisodes();
  }, [physioId]);

  // Analysis animation and actual computation
  const runAnalysis = useCallback(async () => {
    // Add wizard=true to URL to prevent page from switching to settings view during animation
    const url = new URL(window.location.href);
    url.searchParams.set("wizard", "true");
    window.history.replaceState({}, "", url.toString());

    setCurrentStep("analysing");
    setAnalysisProgress(0);
    const startTime = Date.now();

    // Set initial stage with episode count
    setAnalysisStage(`Analyzing clinical notes from ${consentedEpisodes.length} consented episodes...`);

    // First, actually opt in
    setIsOptingIn(true);
    await toggleOptIn(physioId, true);
    setIsOptingIn(false);

    // Time-based progress animation: 4 phases within 9 seconds total
    // Phase 1: 0-2.5s = 0-28%
    // Phase 2: 2.5-5s = 28-53%
    // Phase 3: 5-7s = 53-77%
    // Phase 4: 7-9s = 77-99%
    const INTERVAL_MS = 100; // Update every 100ms for smooth animation

    // Start async operations in parallel (don't wait for them)
    const dataPromise = (async () => {
      try {
        // Actually compute signals
        await recomputeSignals(physioId);

        // Fetch signals and eligibility
        const [signalsRes, eligibilityRes] = await Promise.all([
          fetch(`/api/physio/${physioId}/signals`),
          fetch(`/api/physio/${physioId}/eligibility`),
        ]);

        if (signalsRes.ok) {
          const signalsData = await signalsRes.json();
          setSignals(signalsData.signals);
        }

        if (eligibilityRes.ok) {
          const eligibilityData = await eligibilityRes.json();
          setEligibility(eligibilityData);
        }
      } catch (error) {
        console.error("Error during analysis:", error);
      }
    })();

    // Run animation for exactly 9 seconds
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < 2500) {
        // Phase 1: Analyzing notes (0-2.5 seconds)
        setAnalysisStage(`Analyzing clinical notes from ${consentedEpisodes.length} consented episodes...`);
        setAnalysisProgress((elapsed / 2500) * 28);
      } else if (elapsed < 5000) {
        // Phase 2: Computing signals (2.5-5 seconds)
        setAnalysisStage("Computing outcome trajectories and clinical indicators...");
        setAnalysisProgress(28 + ((elapsed - 2500) / 2500) * 25);
      } else if (elapsed < 7000) {
        // Phase 3: Regional benchmarks (5-7 seconds)
        setAnalysisStage("Matching quality signals to regional benchmarks...");
        setAnalysisProgress(53 + ((elapsed - 5000) / 2000) * 24);
      } else if (elapsed < 9000) {
        // Phase 4: Industry benchmarks (7-9 seconds)
        setAnalysisStage("Comparing against industry and peer benchmarks...");
        setAnalysisProgress(77 + ((elapsed - 7000) / 2000) * 22);
      } else {
        // Animation complete at 9 seconds
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setAnalysisStage("Analysis complete!");

        // Wait for data to be ready, then transition to results
        dataPromise.then(() => {
          setTimeout(() => {
            setCurrentStep("results");
          }, 800);
        });
      }
    }, INTERVAL_MS);
  }, [physioId, consentedEpisodes.length]);

  const handleGoLive = async () => {
    setIsGoingLive(true);
    setShowGoLiveDialog(false);

    await disablePreviewMode(physioId);
    // Remove wizard parameter and navigate
    router.push(`/physio/${physioId}`);
  };

  const handleStayInPreview = () => {
    // Remove wizard parameter and navigate
    router.push(`/physio/${physioId}/signals`);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["consent", "analysing", "results", "go-live"].map((step, index) => {
            const stepOrder = ["consent", "analysing", "results", "go-live"];
            const currentIndex = stepOrder.indexOf(currentStep);
            const isCompleted = index < currentIndex;
            const isCurrent = step === currentStep;

            return (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                        ? "bg-[hsl(var(--kinetic-wine))] text-white"
                        : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-16 sm:w-24",
                      index < currentIndex ? "bg-green-600" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Review</span>
          <span>Analyse</span>
          <span>Results</span>
          <span>Go Live</span>
        </div>
      </div>

      {/* Step 1: Consent Review */}
      {currentStep === "consent" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Review Consented Patients
            </h1>
            <p className="mt-2 text-slate-600">
              These patients have granted consent for their episode data to be
              analyzed. Only GP-referred episodes with consent will contribute
              to your quality signals.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                  <CardTitle>Patients with Consent</CardTitle>
                </div>
                <Badge className="bg-green-600">
                  {consentedEpisodes.length} episodes
                </Badge>
              </div>
              <CardDescription>
                Anonymized patient list for privacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingConsents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : consentedEpisodes.length === 0 ? (
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    No GP-referred episodes with consent found. You can still
                    opt in to preview mode and build signals as patients grant
                    consent.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {consentedEpisodes.slice(0, 10).map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                          <span className="text-sm font-medium text-slate-600">
                            P{episode.patientIndex}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700">
                          Patient #{episode.patientIndex}
                        </span>
                      </div>
                      <Badge variant="secondary">{episode.condition}</Badge>
                    </div>
                  ))}
                  {consentedEpisodes.length > 10 && (
                    <p className="text-center text-sm text-slate-500">
                      + {consentedEpisodes.length - 10} more patients
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    All-or-Nothing Rule
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    By proceeding, you agree to share all consented episode data
                    for signal computation. You cannot selectively share only
                    your best outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`/physio/${physioId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={runAnalysis}
              disabled={isOptingIn}
              className="btn-kinetic text-white"
            >
              {isOptingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Analysing */}
      {currentStep === "analysing" && (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Analysing Your Data
            </h1>
            <p className="mt-2 text-slate-600">
              Computing quality signals from your consented episodes
            </p>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="mx-auto max-w-md">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{analysisStage}</span>
                    <span className="font-medium text-[hsl(var(--kinetic-wine))]">
                      {Math.round(analysisProgress)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--kinetic-wine))] transition-all duration-200"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>

                {/* Stage indicators */}
                <div className="space-y-3">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      analysisProgress > 0 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        analysisProgress >= 25
                          ? "bg-green-100 text-green-600"
                          : analysisProgress > 0
                            ? "bg-[hsl(var(--kinetic-peach))] text-[hsl(var(--kinetic-wine))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {analysisProgress >= 25 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : analysisProgress > 0 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Analyzing consented clinical notes
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      analysisProgress >= 25 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        analysisProgress >= 50
                          ? "bg-green-100 text-green-600"
                          : analysisProgress >= 25
                            ? "bg-[hsl(var(--kinetic-peach))] text-[hsl(var(--kinetic-wine))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {analysisProgress >= 50 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : analysisProgress >= 25 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Computing outcome trajectories and clinical indicators
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      analysisProgress >= 50 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        analysisProgress >= 75
                          ? "bg-green-100 text-green-600"
                          : analysisProgress >= 50
                            ? "bg-[hsl(var(--kinetic-peach))] text-[hsl(var(--kinetic-wine))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {analysisProgress >= 75 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : analysisProgress >= 50 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Matching quality signals to benchmarks
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      analysisProgress >= 75 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        analysisProgress >= 100
                          ? "bg-green-100 text-green-600"
                          : analysisProgress >= 75
                            ? "bg-[hsl(var(--kinetic-peach))] text-[hsl(var(--kinetic-wine))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {analysisProgress >= 100 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : analysisProgress >= 75 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <BarChart3 className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Comparing against industry benchmarks
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Eye className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Preview Mode</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Nothing is published. This preview is only visible to you.
                    You can review your signals and decide when to go live.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Results */}
      {currentStep === "results" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Your Quality Signals
            </h1>
            <p className="mt-2 text-slate-600">
              Here's what we computed from your consented episodes
            </p>
          </div>

          {/* Hero metric - GP Referral Count */}
          {eligibility && eligibility.eligibleReferralSets > 0 ? (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-white shadow-lg">
              <CardContent className="py-6 text-center">
                <div className="flex items-center justify-center gap-6">
                  <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-3">
                    <Rocket className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-5xl font-extrabold text-green-600">
                      {eligibility.eligibleReferralSets}
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      GP Referral Set{eligibility.eligibleReferralSets !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  You're ready to appear in {eligibility.eligibleReferralSets} GP practice{eligibility.eligibleReferralSets !== 1 ? "s" : ""} based on your North London region and strong quality signals
                </p>
              </CardContent>
            </Card>
          ) : eligibility && eligibility.totalReferralSets > 0 ? (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="py-8 text-center">
                <div className="text-5xl font-bold text-amber-600">0</div>
                <p className="mt-2 text-lg text-slate-700">
                  GP referral sets (not yet eligible)
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Build more data to appear in GP searches
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Signal Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {signals.map((signal) => (
              <SignalCard
                key={signal.type}
                title={
                  signal.type === "outcome-trajectory"
                    ? "Outcome Trajectory"
                    : signal.type === "clinical-decision"
                      ? "Clinical Decision"
                      : "Patient Preference"
                }
                description={
                  signal.type === "outcome-trajectory"
                    ? "Patient outcomes"
                    : signal.type === "clinical-decision"
                      ? "Clinical responsiveness"
                      : "Patient retention"
                }
                value={signal.value}
                confidence={signal.confidence}
                episodeCount={signal.episodeCount}
                benchmarkSummary={getBenchmarkForSignalType(physioId, signal.type as "outcome-trajectory" | "clinical-decision" | "patient-preference") ?? undefined}
              />
            ))}
          </div>

          {signals.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-slate-600">
                  No signals computed yet. Signals will appear as patients grant
                  consent for their episodes.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Benchmark Analysis */}
          {(() => {
            const benchmarkData = getBenchmarkSignals(physioId);
            if (!benchmarkData) return null;
            return (
              <div className="space-y-3">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="mx-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Sparkles className="h-3 w-3" />
                    AI Benchmark Analysis
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>
                <BenchmarkDetailPanel data={benchmarkData} defaultExpanded={false} />
                <p className="text-center text-xs text-slate-400">
                  Analysed by Kinetic AI from your clinical notes and episode data
                </p>
              </div>
            );
          })()}

          {/* Confidence Factors */}
          {eligibility && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eligibility Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(eligibility.confidenceFactors).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            value ? "bg-green-500" : "bg-slate-300"
                          )}
                        />
                        <span className="text-slate-600">
                          {key === "regionMatch"
                            ? "Region Match"
                            : key === "signalsComputed"
                              ? "Signals Computed"
                              : key === "outcomeTrajectoryStrong"
                                ? "Strong Outcome Trajectory"
                                : key === "clinicalDecisionStrong"
                                  ? "Strong Clinical Decision"
                                  : "Strong Patient Preference"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>How GPs see this:</strong> GPs see directional
                indicators and confidence dots — never numeric scores. This
                focuses on quality patterns and prevents unhealthy competition.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("analysing")}
              disabled
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep("go-live")}
              className="btn-kinetic text-white"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Go Live */}
      {currentStep === "go-live" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Ready to Go Live?
            </h1>
            <p className="mt-2 text-slate-600">
              Review what happens when you exit preview mode
            </p>
          </div>

          {/* Big Impact Card */}
          {eligibility && eligibility.eligibleReferralSets > 0 && (
            <Card className="border-2 border-[hsl(var(--kinetic-wine)/0.3)] bg-gradient-to-br from-[hsl(var(--kinetic-peach))] to-white">
              <CardContent className="py-10 text-center">
                <div className="mb-3">
                  <div className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--kinetic-wine)/0.1)] p-3">
                    <Rocket className="h-10 w-10 text-[hsl(var(--kinetic-wine))]" />
                  </div>
                </div>
                <div className="text-6xl font-extrabold text-[hsl(var(--kinetic-wine))]">
                  {eligibility.eligibleReferralSets}
                </div>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  GP Practice{eligibility.eligibleReferralSets !== 1 ? "s" : ""} Will See You
                </p>
                <p className="mt-2 text-base text-slate-700">
                  When you go live, {eligibility.eligibleReferralSets === 1 ? "this practice" : "these practices"} can include you in patient referrals
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                <CardTitle>What Happens When You Go Live</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    Appear in GP Referral Sets
                  </p>
                  <p className="text-sm text-slate-600">
                    {eligibility && eligibility.eligibleReferralSets > 0
                      ? `You'll be visible to ${eligibility.eligibleReferralSets} GP practice${eligibility.eligibleReferralSets !== 1 ? "s" : ""} in North London when they refer patients`
                      : "You'll appear in referral sets when you meet eligibility criteria"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    GPs See Directional Indicators
                  </p>
                  <p className="text-sm text-slate-600">
                    GPs see "Positive Trend" or "Building Data" — never numeric
                    scores
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    Return to Preview Anytime
                  </p>
                  <p className="text-sm text-slate-600">
                    You can opt out or return to preview mode whenever you
                    choose
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("results")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleStayInPreview}
              >
                <Eye className="mr-2 h-4 w-4" />
                Stay in Preview
              </Button>
              <Button
                size="lg"
                onClick={() => setShowGoLiveDialog(true)}
                disabled={isGoingLive}
                className="btn-kinetic text-white"
              >
                {isGoingLive ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Going Live...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Go Live Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Go Live Confirmation Dialog */}
      <AlertDialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-6 w-6 text-[hsl(var(--kinetic-wine))]" />
              Confirm Going Live
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-base">
                You're about to exit preview mode and become visible to GPs in
                referral sets.
              </p>
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                <div className="text-4xl font-bold text-green-600">
                  {eligibility?.eligibleReferralSets || 0}
                </div>
                <p className="mt-2 text-sm font-medium text-green-900">
                  GP Practice{(eligibility?.eligibleReferralSets || 0) !== 1 ? "s" : ""} Will See Your Signals
                </p>
                <p className="mt-1 text-xs text-green-800">
                  They can include you in patient referrals based on your quality indicators
                </p>
              </div>
              <p className="text-sm text-slate-600">
                You can return to preview mode or opt out at any time from your settings.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Preview</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGoLive}
              className="bg-[hsl(var(--kinetic-wine))] hover:bg-[hsl(var(--kinetic-burgundy-dark))]"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Go Live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
