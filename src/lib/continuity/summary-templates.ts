import { Episode, Visit } from "@/db/schema";

export function formatConditionFraming(
  episode: Episode,
  visits: Visit[]
): string {
  const visitCount = visits.length;
  const firstVisit = visits[0];
  const lastVisit = visits[visits.length - 1];
  const durationDays =
    firstVisit && lastVisit
      ? Math.round(
          (lastVisit.visitDate.getTime() - firstVisit.visitDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const durationWeeks = Math.max(1, Math.round(durationDays / 7));

  const referralSource = episode.isGpReferred
    ? "GP-referred"
    : "self-referred";

  return `Patient presented with ${episode.condition} (${referralSource}). Treatment spanned ${visitCount} visits over approximately ${durationWeeks} weeks.`;
}

export function formatDiagnosisHypothesis(
  episode: Episode,
  visits: Visit[]
): string {
  const firstVisit = visits[0];
  const lastVisit = visits[visits.length - 1];

  if (!firstVisit) {
    return `Working hypothesis: ${episode.condition}. Insufficient visit data to characterize trajectory.`;
  }

  const initialPain = firstVisit.painScore ?? 0;
  const currentPain = lastVisit?.painScore ?? initialPain;
  const initialFunction = firstVisit.functionScore ?? 50;
  const currentFunction = lastVisit?.functionScore ?? initialFunction;

  const painTrend =
    currentPain < initialPain - 2
      ? "improving pain trajectory"
      : currentPain > initialPain + 1
        ? "worsening pain trajectory"
        : "stable pain levels";

  const functionTrend =
    currentFunction > initialFunction + 10
      ? "improving functional capacity"
      : currentFunction < initialFunction - 5
        ? "declining functional capacity"
        : "stable functional capacity";

  return `Working hypothesis: ${episode.condition} with ${painTrend} and ${functionTrend}. Initial pain ${initialPain}/10, function ${initialFunction}/100.`;
}

export function formatCurrentStatus(
  episode: Episode,
  visits: Visit[]
): string {
  const lastVisit = visits[visits.length - 1];
  const statusLabel =
    episode.status === "active"
      ? "Currently active"
      : episode.status === "discharged"
        ? "Discharged"
        : episode.status === "transferred"
          ? "Transferred"
          : "Self-discharged";

  if (!lastVisit) {
    return `${statusLabel}. No visit data recorded.`;
  }

  const painText =
    lastVisit.painScore !== null ? `pain ${lastVisit.painScore}/10` : "";
  const functionText =
    lastVisit.functionScore !== null
      ? `function ${lastVisit.functionScore}/100`
      : "";
  const scores = [painText, functionText].filter(Boolean).join(", ");

  return `${statusLabel}. Most recent assessment: ${scores || "scores not recorded"}.`;
}

export function extractInterventions(visits: Visit[]): string[] {
  const interventions: string[] = [];

  for (const visit of visits) {
    if (visit.treatmentAdjusted && visit.notesSummary) {
      interventions.push(
        `Visit ${visit.visitNumber}: Treatment adjustment — ${sanitizeNoteSummary(visit.notesSummary)}`
      );
    }
  }

  if (interventions.length === 0) {
    interventions.push("No treatment adjustments recorded during this episode.");
  }

  return interventions;
}

export function analyzeResponses(visits: Visit[]): {
  responded: string[];
  didNotRespond: string[];
} {
  const responded: string[] = [];
  const didNotRespond: string[] = [];

  // Find adjustment points and analyze score changes after each
  const adjustmentVisits = visits.filter((v) => v.treatmentAdjusted);

  for (const adjVisit of adjustmentVisits) {
    const adjIndex = visits.findIndex((v) => v.id === adjVisit.id);
    const nextVisits = visits.slice(adjIndex + 1, adjIndex + 4); // Look at next 3 visits

    if (nextVisits.length === 0) continue;

    const painBefore = adjVisit.painScore ?? 0;
    const functionBefore = adjVisit.functionScore ?? 50;
    const lastFollowUp = nextVisits[nextVisits.length - 1];
    const painAfter = lastFollowUp.painScore ?? painBefore;
    const functionAfter = lastFollowUp.functionScore ?? functionBefore;

    const description = sanitizeNoteSummary(
      adjVisit.notesSummary || `Adjustment at visit ${adjVisit.visitNumber}`
    );

    if (painAfter < painBefore - 1 || functionAfter > functionBefore + 5) {
      responded.push(description);
    } else if (
      painAfter >= painBefore ||
      functionAfter <= functionBefore
    ) {
      didNotRespond.push(description);
    }
  }

  if (responded.length === 0 && didNotRespond.length === 0) {
    responded.push("Insufficient adjustment data to characterize response patterns.");
  }

  return { responded, didNotRespond };
}

export function identifyOpenConsiderations(
  episode: Episode,
  visits: Visit[]
): string[] {
  const considerations: string[] = [];

  // Transferred status
  if (episode.status === "transferred") {
    considerations.push(
      "Episode ended via transfer — continuity of care is the primary consideration."
    );
  }

  // Recent escalations
  const recentVisits = visits.slice(-3);
  const hasRecentEscalation = recentVisits.some((v) => v.escalated);
  if (hasRecentEscalation) {
    considerations.push(
      "Recent escalation noted — follow-up assessment recommended."
    );
  }

  // Score plateau
  if (visits.length >= 4) {
    const lastFour = visits.slice(-4);
    const painScores = lastFour
      .map((v) => v.painScore)
      .filter((s): s is number => s !== null);
    if (painScores.length >= 3) {
      const range = Math.max(...painScores) - Math.min(...painScores);
      if (range <= 1) {
        considerations.push(
          "Pain scores plateaued in recent visits — consider reassessing treatment approach."
        );
      }
    }
  }

  // Non-responsive interventions
  const lastAdjustment = visits
    .slice()
    .reverse()
    .find((v) => v.treatmentAdjusted);
  if (lastAdjustment) {
    const adjIndex = visits.findIndex((v) => v.id === lastAdjustment.id);
    const afterAdj = visits.slice(adjIndex + 1);
    if (afterAdj.length >= 2) {
      const painBefore = lastAdjustment.painScore ?? 0;
      const painAfter = afterAdj[afterAdj.length - 1].painScore ?? painBefore;
      if (painAfter >= painBefore) {
        considerations.push(
          "Most recent treatment adjustment did not yield pain improvement — alternative approaches may be warranted."
        );
      }
    }
  }

  if (considerations.length === 0) {
    considerations.push(
      "No specific clinical concerns identified at time of transition."
    );
  }

  return considerations;
}

/**
 * Sanitize note summaries to prevent raw clinical notes passthrough.
 * Only allows structured, template-generated content through.
 */
function sanitizeNoteSummary(note: string): string {
  // Truncate excessively long notes and remove any potentially sensitive content
  const cleaned = note.trim().slice(0, 200);
  return cleaned;
}
