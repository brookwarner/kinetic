import {
  SignalResult,
  EpisodeWithVisits,
  ClinicalDecisionDetails,
} from "./types";

export function computeClinicalDecision(
  episodes: EpisodeWithVisits[]
): SignalResult {
  if (episodes.length === 0) {
    return {
      value: 0,
      confidence: "low",
      episodeCount: 0,
      details: {},
    };
  }

  let totalEscalations = 0;
  let totalVisits = 0;
  let totalEscalationTimingScore = 0;
  let episodesWithEscalation = 0;
  let totalAdjustmentResponsiveness = 0;
  let episodesWithAdjustments = 0;

  for (const { episode, visits } of episodes) {
    if (visits.length < 2) continue;

    totalVisits += visits.length;

    // Track escalations
    const escalatedVisits = visits.filter((v) => v.escalated);
    totalEscalations += escalatedVisits.length;

    if (escalatedVisits.length > 0) {
      episodesWithEscalation++;

      // Escalation timing: earlier escalation when needed is better
      // Check if escalation happened when pain was high or function was low
      const firstEscalation = escalatedVisits[0];
      const visitIndex = visits.findIndex((v) => v.id === firstEscalation.id);

      if (visitIndex > 0 && visitIndex <= 3) {
        // Early escalation (visits 2-4)
        const priorVisit = visits[visitIndex - 1];
        if (
          (priorVisit.painScore !== null && priorVisit.painScore >= 7) ||
          (priorVisit.functionScore !== null && priorVisit.functionScore <= 40)
        ) {
          totalEscalationTimingScore += 1.0; // Appropriate early escalation
        } else {
          totalEscalationTimingScore += 0.7; // Early but maybe premature
        }
      } else if (visitIndex > 3) {
        // Late escalation
        totalEscalationTimingScore += 0.4; // Could have been earlier
      }
    }

    // Treatment adjustment responsiveness
    const adjustmentVisits = visits.filter((v) => v.treatmentAdjusted);
    if (adjustmentVisits.length > 0) {
      episodesWithAdjustments++;

      // Check if adjustments led to improvements
      for (const adjustment of adjustmentVisits) {
        const adjustIndex = visits.findIndex((v) => v.id === adjustment.id);
        if (adjustIndex < visits.length - 1) {
          const nextVisit = visits[adjustIndex + 1];

          let improved = false;
          if (
            adjustment.painScore !== null &&
            nextVisit.painScore !== null
          ) {
            improved = nextVisit.painScore < adjustment.painScore;
          }
          if (
            adjustment.functionScore !== null &&
            nextVisit.functionScore !== null
          ) {
            improved =
              improved || nextVisit.functionScore > adjustment.functionScore;
          }

          totalAdjustmentResponsiveness += improved ? 1.0 : 0.3;
        }
      }
    }
  }

  const escalationRate = totalVisits > 0 ? totalEscalations / totalVisits : 0;
  const avgEscalationTiming =
    episodesWithEscalation > 0
      ? totalEscalationTimingScore / episodesWithEscalation
      : 0.5;
  const avgAdjustmentResponsiveness =
    episodesWithAdjustments > 0
      ? totalAdjustmentResponsiveness /
        episodes.filter((e) => e.visits.some((v) => v.treatmentAdjusted))
          .length
      : 0.5;

  // Optimal escalation rate is ~5-10% (not too high, not too low)
  const escalationRateScore =
    escalationRate > 0.15
      ? 0.4 // Too many escalations
      : escalationRate < 0.02
        ? 0.5 // Too few (might be missing problems)
        : 1.0 - Math.abs(0.075 - escalationRate) / 0.075;

  const value =
    escalationRateScore * 0.3 +
    avgEscalationTiming * 0.4 +
    avgAdjustmentResponsiveness * 0.3;

  let confidence: "low" | "medium" | "high" = "low";
  if (episodes.length >= 10) confidence = "high";
  else if (episodes.length >= 5) confidence = "medium";

  const details: ClinicalDecisionDetails = {
    escalationRate,
    appropriateEscalationTiming: avgEscalationTiming,
    treatmentAdjustmentResponsiveness: avgAdjustmentResponsiveness,
  };

  return {
    value,
    confidence,
    episodeCount: episodes.length,
    details,
  };
}
