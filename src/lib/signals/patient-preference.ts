import {
  SignalResult,
  EpisodeWithVisits,
  PatientPreferenceDetails,
} from "./types";

export function computePatientPreference(
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

  // Count inbound transfers (patients who had prior episodes with other physios)
  const inboundTransfers = episodes.filter(
    (e) => e.episode.priorPhysioEpisodeId !== null
  ).length;
  const inboundTransferRate =
    episodes.length > 0 ? inboundTransfers / episodes.length : 0;

  // Successful handoffs: transferred episodes where patient had good outcomes
  const transferredEpisodes = episodes.filter(
    (e) => e.episode.status === "transferred"
  );
  let successfulHandoffs = 0;

  for (const { visits } of transferredEpisodes) {
    if (visits.length === 0) continue;
    const lastVisit = visits[visits.length - 1];

    // Consider handoff successful if patient was improving
    if (
      (lastVisit.painScore !== null && lastVisit.painScore <= 5) ||
      (lastVisit.functionScore !== null && lastVisit.functionScore >= 60)
    ) {
      successfulHandoffs++;
    }
  }

  const successfulHandoffRate =
    transferredEpisodes.length > 0
      ? successfulHandoffs / transferredEpisodes.length
      : 0.5;

  // Retention indicator: % of episodes that complete (not self-discharged)
  const completedEpisodes = episodes.filter(
    (e) =>
      e.episode.status === "discharged" || e.episode.status === "transferred"
  ).length;
  const selfDischargedEpisodes = episodes.filter(
    (e) => e.episode.status === "self-discharged"
  ).length;

  const retentionIndicator =
    episodes.length > 0
      ? (completedEpisodes + selfDischargedEpisodes * 0.3) / episodes.length
      : 0.5;

  // Overall value: combination of indicators
  // High inbound transfers = patients choosing this physio
  // High successful handoffs = good clinical judgment on when to refer
  // High retention = patients stay and complete treatment
  const value =
    inboundTransferRate * 0.4 +
    successfulHandoffRate * 0.3 +
    retentionIndicator * 0.3;

  let confidence: "low" | "medium" | "high" = "low";
  if (episodes.length >= 10) confidence = "high";
  else if (episodes.length >= 5) confidence = "medium";

  const details: PatientPreferenceDetails = {
    inboundTransferRate,
    successfulHandoffRate,
    retentionIndicator,
  };

  return {
    value,
    confidence,
    episodeCount: episodes.length,
    details,
  };
}
