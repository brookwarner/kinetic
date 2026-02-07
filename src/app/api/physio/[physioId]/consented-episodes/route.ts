import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes, consents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ physioId: string }> }
) {
  const { physioId } = await params;

  try {
    // Fetch GP-referred episodes with granted consent
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
      .where(
        and(
          eq(episodes.physioId, physioId),
          eq(episodes.isGpReferred, true)
        )
      );

    // Filter to only episodes with consent and create anonymized list
    const consentedEpisodes = episodeData
      .filter((e) => e.consent !== null)
      .map((e, index) => ({
        id: e.episode.id,
        condition: e.episode.condition,
        patientIndex: index + 1,
      }));

    return NextResponse.json({ episodes: consentedEpisodes });
  } catch (error) {
    console.error("Error fetching consented episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch consented episodes" },
      { status: 500 }
    );
  }
}
