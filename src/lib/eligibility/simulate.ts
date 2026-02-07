import { db } from "@/db";
import { gps, physiotherapists, computedSignals } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface EligibilityResult {
  eligibleReferralSets: number;
  totalReferralSets: number;
  confidenceFactors: {
    regionMatch: boolean;
    signalsComputed: boolean;
    outcomeTrajectoryStrong: boolean;
    clinicalDecisionStrong: boolean;
    patientPreferenceStrong: boolean;
  };
  gaps: string[];
}

export async function simulateEligibility(
  physioId: string
): Promise<EligibilityResult> {
  // Fetch physio data
  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    throw new Error("Physiotherapist not found");
  }

  // Fetch all GPs (potential referral sets)
  const allGPs = await db.select().from(gps);

  // Fetch signals for this physio
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

  // Check if physio is opted in
  if (!physio.optedIn) {
    return {
      eligibleReferralSets: 0,
      totalReferralSets: allGPs.length,
      confidenceFactors: {
        regionMatch: false,
        signalsComputed: false,
        outcomeTrajectoryStrong: false,
        clinicalDecisionStrong: false,
        patientPreferenceStrong: false,
      },
      gaps: ["Not opted in to Kinetic"],
    };
  }

  // Calculate eligibility for each GP's referral set
  let eligibleCount = 0;
  const gaps: string[] = [];
  const confidenceFactors = {
    regionMatch: false,
    signalsComputed: signals.length > 0,
    outcomeTrajectoryStrong: false,
    clinicalDecisionStrong: false,
    patientPreferenceStrong: false,
  };

  for (const gp of allGPs) {
    // Eligibility criteria:
    // 1. Region match
    const regionMatches = physio.region === gp.region;
    if (regionMatches) {
      confidenceFactors.regionMatch = true;
    }

    // 2. Signals exist and meet threshold
    const hasStrongOutcome =
      outcomeSignal && outcomeSignal.value >= 60 && outcomeSignal.confidence !== "low";
    const hasStrongClinical =
      clinicalSignal && clinicalSignal.value >= 60 && clinicalSignal.confidence !== "low";
    const hasStrongPreference =
      preferenceSignal && preferenceSignal.value >= 50;

    if (hasStrongOutcome) confidenceFactors.outcomeTrajectoryStrong = true;
    if (hasStrongClinical) confidenceFactors.clinicalDecisionStrong = true;
    if (hasStrongPreference) confidenceFactors.patientPreferenceStrong = true;

    // A physio is eligible if:
    // - Region matches AND
    // - At least 2 out of 3 signals are strong
    const strongSignalCount =
      (hasStrongOutcome ? 1 : 0) +
      (hasStrongClinical ? 1 : 0) +
      (hasStrongPreference ? 1 : 0);

    if (regionMatches && strongSignalCount >= 2) {
      eligibleCount++;
    }
  }

  // Identify gaps
  if (!confidenceFactors.regionMatch) {
    gaps.push("No GPs in your region");
  }
  if (!confidenceFactors.signalsComputed) {
    gaps.push("No signals computed yet - need episodes with patient consent");
  }
  if (
    !confidenceFactors.outcomeTrajectoryStrong &&
    !confidenceFactors.clinicalDecisionStrong &&
    !confidenceFactors.patientPreferenceStrong
  ) {
    gaps.push("Signals need more data or stronger patterns");
  }

  return {
    eligibleReferralSets: eligibleCount,
    totalReferralSets: allGPs.length,
    confidenceFactors,
    gaps,
  };
}
