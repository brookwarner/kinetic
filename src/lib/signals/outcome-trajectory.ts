import {
  SignalResult,
  EpisodeWithVisits,
  OutcomeTrajectoryDetails,
} from "./types";

export function computeOutcomeTrajectory(
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

  let totalPainReduction = 0;
  let totalFunctionImprovement = 0;
  let totalTaperingScore = 0;
  let totalDischargeScore = 0;
  let validEpisodes = 0;

  for (const { episode, visits } of episodes) {
    if (visits.length < 3) continue; // Need minimum visits for meaningful trajectory

    validEpisodes++;

    // Pain reduction (first to last visit)
    const firstVisit = visits[0];
    const lastVisit = visits[visits.length - 1];

    if (
      firstVisit.painScore !== null &&
      lastVisit.painScore !== null &&
      firstVisit.painScore > 0
    ) {
      const reduction =
        (firstVisit.painScore - lastVisit.painScore) / firstVisit.painScore;
      totalPainReduction += Math.max(0, Math.min(1, reduction));
    }

    // Function improvement
    if (
      firstVisit.functionScore !== null &&
      lastVisit.functionScore !== null &&
      firstVisit.functionScore < 100
    ) {
      const improvement =
        (lastVisit.functionScore - firstVisit.functionScore) /
        (100 - firstVisit.functionScore);
      totalFunctionImprovement += Math.max(0, Math.min(1, improvement));
    }

    // Visit frequency tapering (ideal: visits get less frequent as patient improves)
    if (visits.length >= 4) {
      const firstHalfVisits = Math.floor(visits.length / 2);
      const firstHalfDays =
        visits[firstHalfVisits].visitDate.getTime() -
        visits[0].visitDate.getTime();
      const secondHalfDays =
        visits[visits.length - 1].visitDate.getTime() -
        visits[firstHalfVisits].visitDate.getTime();

      if (firstHalfDays > 0 && secondHalfDays > 0) {
        const firstHalfFreq = firstHalfVisits / (firstHalfDays / (1000 * 60 * 60 * 24));
        const secondHalfFreq =
          (visits.length - firstHalfVisits) / (secondHalfDays / (1000 * 60 * 60 * 24));

        // Tapering means second half frequency is lower
        if (secondHalfFreq < firstHalfFreq) {
          totalTaperingScore += 0.8; // Good tapering
        } else if (secondHalfFreq === firstHalfFreq) {
          totalTaperingScore += 0.5; // Neutral
        } else {
          totalTaperingScore += 0.2; // Increasing frequency (might indicate complications)
        }
      }
    }

    // Appropriate discharge
    if (episode.status === "discharged") {
      // Good discharge: low pain, high function
      if (lastVisit.painScore !== null && lastVisit.functionScore !== null) {
        const painFactor = 1 - lastVisit.painScore / 10; // 0 pain = 1.0
        const functionFactor = lastVisit.functionScore / 100;
        totalDischargeScore += (painFactor + functionFactor) / 2;
      } else {
        totalDischargeScore += 0.5; // Neutral if no scores
      }
    } else if (episode.status === "self-discharged") {
      totalDischargeScore += 0.2; // Self-discharge is less ideal
    } else {
      totalDischargeScore += 0.5; // Active/transferred are neutral
    }
  }

  const avgPainReduction = validEpisodes > 0 ? totalPainReduction / validEpisodes : 0;
  const avgFunctionImprovement =
    validEpisodes > 0 ? totalFunctionImprovement / validEpisodes : 0;
  const avgTapering = validEpisodes > 0 ? totalTaperingScore / validEpisodes : 0.5;
  const avgDischarge = validEpisodes > 0 ? totalDischargeScore / validEpisodes : 0.5;

  // Overall value: weighted average
  const value =
    avgPainReduction * 0.3 +
    avgFunctionImprovement * 0.3 +
    avgTapering * 0.2 +
    avgDischarge * 0.2;

  // Confidence based on episode count
  let confidence: "low" | "medium" | "high" = "low";
  if (validEpisodes >= 10) confidence = "high";
  else if (validEpisodes >= 5) confidence = "medium";

  const details: OutcomeTrajectoryDetails = {
    avgPainReduction,
    avgFunctionImprovement,
    visitFrequencyTapering: avgTapering,
    appropriateDischarge: avgDischarge,
  };

  return {
    value,
    confidence,
    episodeCount: validEpisodes,
    details,
  };
}
