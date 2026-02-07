import { Episode, Visit } from "@/db/schema";

// Input types for summary generation
export interface SummaryInput {
  episode: Episode;
  visits: Visit[];
  patientName: string;
}

// Structured summary content output
export interface SummaryContent {
  conditionFraming: string;
  diagnosisHypothesis: string;
  interventionsAttempted: string[];
  responseProfile: ResponseProfile;
  currentStatus: string;
  openConsiderations: string[];
}

export interface ResponseProfile {
  responded: string[];
  didNotRespond: string[];
}

// Transition status state machine
export type TransitionStatus =
  | "initiated"
  | "consent-pending"
  | "summary-pending"
  | "review-pending"
  | "released"
  | "declined"
  | "expired";

export type SummaryStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "released"
  | "revoked";

export type ContinuityConsentStatus = "granted" | "revoked" | "expired";

// Valid transitions for the state machine
export const VALID_TRANSITION_FLOWS: Record<TransitionStatus, TransitionStatus[]> = {
  "initiated": ["consent-pending", "declined"],
  "consent-pending": ["summary-pending", "declined", "expired"],
  "summary-pending": ["review-pending"],
  "review-pending": ["released", "declined"],
  "released": [],
  "declined": [],
  "expired": [],
};

export const VALID_SUMMARY_FLOWS: Record<SummaryStatus, SummaryStatus[]> = {
  "draft": ["pending-review"],
  "pending-review": ["approved", "revoked"],
  "approved": ["released", "revoked"],
  "released": ["revoked"],
  "revoked": [],
};

export function isValidTransition(
  current: TransitionStatus,
  next: TransitionStatus
): boolean {
  return VALID_TRANSITION_FLOWS[current]?.includes(next) ?? false;
}

export function isValidSummaryTransition(
  current: SummaryStatus,
  next: SummaryStatus
): boolean {
  return VALID_SUMMARY_FLOWS[current]?.includes(next) ?? false;
}
