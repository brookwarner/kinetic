import { Episode, Visit } from "@/db/schema";

export type SignalType =
  | "outcome-trajectory"
  | "clinical-decision"
  | "patient-preference";

export type SignalConfidence = "low" | "medium" | "high";

export interface EpisodeWithVisits {
  episode: Episode;
  visits: Visit[];
}

export interface SignalResult {
  value: number; // 0-1 normalized value
  confidence: SignalConfidence;
  episodeCount: number;
  details: Record<string, any>;
}

export interface OutcomeTrajectoryDetails {
  avgPainReduction: number;
  avgFunctionImprovement: number;
  visitFrequencyTapering: number; // 0-1, higher is better
  appropriateDischarge: number; // 0-1, higher is better
}

export interface ClinicalDecisionDetails {
  escalationRate: number;
  appropriateEscalationTiming: number; // 0-1
  treatmentAdjustmentResponsiveness: number; // 0-1
}

export interface PatientPreferenceDetails {
  inboundTransferRate: number; // Patients coming from other physios
  successfulHandoffRate: number; // 0-1
  retentionIndicator: number; // 0-1
}
