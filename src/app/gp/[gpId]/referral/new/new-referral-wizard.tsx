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
import { Textarea } from "@/components/ui/textarea";
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
import { PatientCard } from "@/components/gp/patient-card";
import { PhysioResultCard } from "@/components/gp/physio-result-card";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Loader2,
  Search,
  Send,
  User,
} from "lucide-react";
import { getBenchmarkSignals, getTopBenchmarkSignal } from "@/lib/signals/benchmark-data";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  region: string;
  notes: string | null;
}

interface PhysioResult {
  id: string;
  name: string;
  clinicName: string;
  region: string;
  capacity: "available" | "limited" | "waitlist";
  specialties: string[];
  sameRegion: boolean;
  signals: Array<{
    type: string;
    value: number;
    confidence: "low" | "medium" | "high";
  }>;
}

type WizardStep = "patient" | "searching" | "results";

interface NewReferralWizardProps {
  gpId: string;
  gpRegion: string;
}

export function NewReferralWizard({ gpId, gpRegion }: NewReferralWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("patient");

  // Patient selection state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");

  // Search state
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStage, setSearchStage] = useState("");

  // Results state
  const [physioResults, setPhysioResults] = useState<PhysioResult[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPhysio, setSelectedPhysio] = useState<PhysioResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load patients on mount
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch(`/api/gp/${gpId}/patients`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients);
        }
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setIsLoadingPatients(false);
      }
    }

    loadPatients();
  }, [gpId]);

  // When a patient is selected, load their notes
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setClinicalNotes(patient.notes || "");
  };

  // Run search animation and fetch physios
  const runSearch = useCallback(async () => {
    if (!selectedPatient) return;

    setCurrentStep("searching");
    setSearchProgress(0);
    const startTime = Date.now();

    // Set initial stage
    setSearchStage("Reviewing patient history...");

    // Start async search in background
    const searchPromise = (async () => {
      try {
        const res = await fetch(`/api/gp/${gpId}/find-physios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientRegion: selectedPatient.region }),
        });
        if (res.ok) {
          const data = await res.json();
          setPhysioResults(data.physios);
        }
      } catch (error) {
        console.error("Error finding physios:", error);
      }
    })();

    // Time-based progress animation: 2 seconds per phase (6 seconds total)
    const INTERVAL_MS = 100;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < 1500) {
        // Phase 1: Reviewing patient (0-1.5 seconds)
        setSearchStage("Reviewing patient history...");
        setSearchProgress((elapsed / 1500) * 25);
      } else if (elapsed < 3000) {
        // Phase 2: Analyzing physios (1.5-3 seconds)
        setSearchStage("Analyzing local physiotherapists...");
        setSearchProgress(25 + ((elapsed - 1500) / 1500) * 25);
      } else if (elapsed < 4500) {
        // Phase 3: Quality benchmarks (3-4.5 seconds)
        setSearchStage("Checking quality benchmarks...");
        setSearchProgress(50 + ((elapsed - 3000) / 1500) * 25);
      } else if (elapsed < 6000) {
        // Phase 4: Matching (4.5-6 seconds)
        setSearchStage("Matching quality to patient needs...");
        setSearchProgress(75 + ((elapsed - 4500) / 1500) * 24);
      } else {
        // Animation complete at 6 seconds
        clearInterval(progressInterval);
        setSearchProgress(100);
        setSearchStage("Search complete!");

        setTimeout(() => {
          setCurrentStep("results");
        }, 600);
      }
    }, INTERVAL_MS);
  }, [gpId, selectedPatient]);

  const handleBeginReferral = (physio: PhysioResult) => {
    setSelectedPhysio(physio);
    setShowConfirmDialog(true);
  };

  const handleConfirmReferral = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    // Simulate referral submission (demo only - no actual database record)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate back to dashboard with success
    router.push(`/gp/${gpId}?referral=success`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["patient", "searching", "results"].map((step, index) => {
            const stepOrder = ["patient", "searching", "results"];
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
                        ? "bg-[hsl(var(--kinetic-sage))] text-white"
                        : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-24 sm:w-32",
                      index < currentIndex ? "bg-green-600" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Select Patient</span>
          <span>Find Matches</span>
          <span>Choose Physio</span>
        </div>
      </div>

      {/* Step 1: Patient Selection */}
      {currentStep === "patient" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Select a Patient
            </h1>
            <p className="mt-2 text-slate-600">
              Choose the patient you want to refer and review their clinical notes.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Patient List */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[hsl(var(--kinetic-sage))]" />
                  <CardTitle>Patients</CardTitle>
                </div>
                <CardDescription>
                  Patients in {gpRegion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPatients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : patients.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No patients found in your region.
                  </p>
                ) : (
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {patients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        id={patient.id}
                        name={patient.name}
                        dateOfBirth={patient.dateOfBirth}
                        region={patient.region}
                        hasNotes={!!patient.notes}
                        isSelected={selectedPatient?.id === patient.id}
                        onClick={() => handlePatientSelect(patient)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[hsl(var(--kinetic-sage))]" />
                  <CardTitle>Clinical Notes</CardTitle>
                </div>
                <CardDescription>
                  {selectedPatient
                    ? `Notes for ${selectedPatient.name}`
                    : "Select a patient to view notes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <Textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Add clinical notes for the referral..."
                    className="min-h-[280px] resize-none"
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                    <p className="text-sm text-slate-500">
                      Select a patient to view or add notes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`/gp/${gpId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={runSearch}
              disabled={!selectedPatient}
              className="btn-gp text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Find Physiotherapists
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Searching */}
      {currentStep === "searching" && (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Finding Matches
            </h1>
            <p className="mt-2 text-slate-600">
              Searching for physiotherapists who match {selectedPatient?.name}'s needs
            </p>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="mx-auto max-w-md">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{searchStage}</span>
                    <span className="font-medium text-[hsl(var(--kinetic-sage))]">
                      {Math.round(searchProgress)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--kinetic-sage))] transition-all duration-200"
                      style={{ width: `${searchProgress}%` }}
                    />
                  </div>
                </div>

                {/* Stage indicators */}
                <div className="space-y-3">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      searchProgress > 0 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        searchProgress >= 25
                          ? "bg-green-100 text-green-600"
                          : searchProgress > 0
                            ? "bg-[hsl(var(--kinetic-sage-light))] text-[hsl(var(--kinetic-sage))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {searchProgress >= 25 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : searchProgress > 0 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Reviewing patient history and clinical notes
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      searchProgress >= 25 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        searchProgress >= 50
                          ? "bg-green-100 text-green-600"
                          : searchProgress >= 25
                            ? "bg-[hsl(var(--kinetic-sage-light))] text-[hsl(var(--kinetic-sage))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {searchProgress >= 50 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : searchProgress >= 25 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Analyzing local physiotherapists in {selectedPatient?.region}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      searchProgress >= 50 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        searchProgress >= 75
                          ? "bg-green-100 text-green-600"
                          : searchProgress >= 50
                            ? "bg-[hsl(var(--kinetic-sage-light))] text-[hsl(var(--kinetic-sage))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {searchProgress >= 75 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : searchProgress >= 50 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <BarChart3 className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Checking quality benchmarks
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      searchProgress >= 75 ? "bg-slate-50" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        searchProgress >= 100
                          ? "bg-green-100 text-green-600"
                          : searchProgress >= 75
                            ? "bg-[hsl(var(--kinetic-sage-light))] text-[hsl(var(--kinetic-sage))]"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {searchProgress >= 100 ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : searchProgress >= 75 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">
                      Matching quality signals to patient needs
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Results */}
      {currentStep === "results" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Matching Physiotherapists
            </h1>
            <p className="mt-2 text-slate-600">
              {physioResults.length} physiotherapist{physioResults.length !== 1 ? "s" : ""} found for {selectedPatient?.name}
            </p>
          </div>

          {physioResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900">No Matches Found</h3>
                <p className="mt-2 text-sm text-slate-600">
                  No opted-in physiotherapists are currently available in this region.
                  Try again later as more providers join.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {physioResults.map((physio) => {
                const benchmarkData = getBenchmarkSignals(physio.id);
                const topSignal = getTopBenchmarkSignal(physio.id);
                return (
                  <PhysioResultCard
                    key={physio.id}
                    {...physio}
                    onBeginReferral={() => handleBeginReferral(physio)}
                    benchmarkPercentile={
                      benchmarkData && topSignal
                        ? {
                            overall: benchmarkData.overallPercentile,
                            topSignal: topSignal.label,
                            topPercentile: topSignal.percentile,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>AI-powered quality matching:</strong> Physiotherapists are matched using
                AI-analysed quality benchmarks including recovery rates, evidence alignment,
                and patient outcomes — never ranked numerically. You retain full control over
                which provider to refer to.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("patient")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patient
            </Button>
          </div>
        </div>
      )}

      {/* Referral Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Send className="h-6 w-6 text-[hsl(var(--kinetic-sage))]" />
              Confirm Referral
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-base">
                You're about to refer <strong>{selectedPatient?.name}</strong> to{" "}
                <strong>{selectedPhysio?.name}</strong> at {selectedPhysio?.clinicName}.
              </p>
              <div className="rounded-lg bg-[hsl(var(--kinetic-sage-light))] p-4">
                <p className="text-sm font-medium text-[hsl(var(--kinetic-sage-dark))]">
                  What happens next:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  <li>• The physiotherapist will receive the referral</li>
                  <li>• Clinical notes will be shared with the provider</li>
                  <li>• You'll be notified when the patient is seen</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReferral}
              disabled={isSubmitting}
              className="bg-[hsl(var(--kinetic-sage))] hover:bg-[hsl(var(--kinetic-sage-dark))]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Referral
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
