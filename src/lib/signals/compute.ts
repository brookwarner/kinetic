import { db } from "@/db";
import { episodes, visits, consents, computedSignals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { EpisodeWithVisits, SignalType } from "./types";
import { computeOutcomeTrajectory } from "./outcome-trajectory";
import { computeClinicalDecision } from "./clinical-decision";
import { computePatientPreference } from "./patient-preference";

export async function computeSignalsForPhysio(physioId: string) {
  // Fetch episodes with patient consent
  const episodeData = await db
    .select({
      episode: episodes,
      consent: consents,
    })
    .from(episodes)
    .leftJoin(
      consents,
      and(
        eq(consents.episodeId, episodes.id),
        eq(consents.status, "granted")
      )
    )
    .where(eq(episodes.physioId, physioId));

  // Filter to only episodes with consent
  const consentedEpisodes = episodeData.filter(
    (e) => e.consent !== null
  );

  if (consentedEpisodes.length === 0) {
    console.log(`No consented episodes for physio ${physioId}`);
    return;
  }

  // Fetch visits for these episodes
  const episodesWithVisits: EpisodeWithVisits[] = [];

  for (const { episode } of consentedEpisodes) {
    const episodeVisits = await db
      .select()
      .from(visits)
      .where(eq(visits.episodeId, episode.id))
      .orderBy(visits.visitNumber);

    episodesWithVisits.push({
      episode,
      visits: episodeVisits,
    });
  }

  // Compute each signal type
  const signals: Array<{
    type: SignalType;
    result: ReturnType<
      | typeof computeOutcomeTrajectory
      | typeof computeClinicalDecision
      | typeof computePatientPreference
    >;
  }> = [
    {
      type: "outcome-trajectory",
      result: computeOutcomeTrajectory(episodesWithVisits),
    },
    {
      type: "clinical-decision",
      result: computeClinicalDecision(episodesWithVisits),
    },
    {
      type: "patient-preference",
      result: computePatientPreference(episodesWithVisits),
    },
  ];

  // Upsert signals to database
  for (const { type, result } of signals) {
    // Delete old signal of this type
    await db
      .delete(computedSignals)
      .where(
        and(
          eq(computedSignals.physioId, physioId),
          eq(computedSignals.signalType, type)
        )
      );

    // Insert new signal
    await db.insert(computedSignals).values({
      id: `signal-${physioId}-${type}-${Date.now()}`,
      physioId,
      signalType: type,
      value: Math.round(result.value * 100), // Store as 0-100 integer
      confidence: result.confidence,
      episodeCount: result.episodeCount,
      computedAt: new Date(),
      details: result.details as any,
    });
  }

  console.log(`Computed signals for physio ${physioId}`);
  return signals;
}
