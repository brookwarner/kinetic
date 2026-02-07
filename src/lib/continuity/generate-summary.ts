import { SummaryInput, SummaryContent } from "./types";
import {
  formatConditionFraming,
  formatDiagnosisHypothesis,
  formatCurrentStatus,
  extractInterventions,
  analyzeResponses,
  identifyOpenConsiderations,
} from "./summary-templates";

/**
 * Generates a structured continuity summary from episode and visit data.
 *
 * This is a pure function that transforms clinical data into a structured
 * handoff document. It follows the same pattern as the signal computation
 * engine — deterministic templates, no AI generation, no raw note passthrough.
 *
 * Explicit exclusions enforced:
 * - No raw notesSummary passthrough (sanitized in templates)
 * - No comparative statements between providers
 * - No performance evaluation language
 */
export function generateSummary(input: SummaryInput): SummaryContent {
  const { episode, visits } = input;

  // Sort visits by visit number to ensure correct ordering
  const sortedVisits = [...visits].sort(
    (a, b) => a.visitNumber - b.visitNumber
  );

  return {
    conditionFraming: formatConditionFraming(episode, sortedVisits),
    diagnosisHypothesis: formatDiagnosisHypothesis(episode, sortedVisits),
    interventionsAttempted: extractInterventions(sortedVisits),
    responseProfile: analyzeResponses(sortedVisits),
    currentStatus: formatCurrentStatus(episode, sortedVisits),
    openConsiderations: identifyOpenConsiderations(episode, sortedVisits),
  };
}
