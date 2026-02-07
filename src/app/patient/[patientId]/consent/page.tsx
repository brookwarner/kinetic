import { db } from "@/db";
import {
  patients,
  episodes,
  consents,
  physiotherapists,
  transitionEvents,
  continuityConsents,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConsentForm } from "@/components/patient/consent-form";
import { ContinuityConsentForm } from "@/components/patient/continuity-consent-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ episode?: string; transition?: string }>;
}

export default async function PatientConsentPage({
  params,
  searchParams,
}: Props) {
  const { patientId } = await params;
  const { episode: episodeId, transition: transitionId } = await searchParams;

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId));

  if (!patient) {
    notFound();
  }

  // Handle continuity consent for transitions
  if (transitionId) {
    const [transition] = await db
      .select()
      .from(transitionEvents)
      .where(eq(transitionEvents.id, transitionId));

    if (!transition || transition.patientId !== patientId) {
      notFound();
    }

    // Fetch origin physio name
    const [originPhysio] = await db
      .select()
      .from(physiotherapists)
      .where(eq(physiotherapists.id, transition.originPhysioId));

    // Fetch destination physio name
    let destinationPhysioName: string | null = null;
    if (transition.destinationPhysioId) {
      const [destPhysio] = await db
        .select()
        .from(physiotherapists)
        .where(eq(physiotherapists.id, transition.destinationPhysioId));
      destinationPhysioName = destPhysio?.name ?? null;
    }

    // Fetch origin episode for condition
    const [originEpisode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, transition.originEpisodeId));

    // Fetch existing continuity consent
    const [existingConsent] = await db
      .select()
      .from(continuityConsents)
      .where(eq(continuityConsents.transitionEventId, transitionId));

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Care Transition Consent
          </h1>
          <p className="mt-2 text-slate-600">{patient.name}</p>
          <p className="text-sm text-slate-500">
            Episode: {originEpisode?.condition ?? "Unknown"} with{" "}
            {originPhysio?.name ?? "Unknown"}
          </p>
        </div>

        <ContinuityConsentForm
          patientId={patientId}
          transitionEventId={transitionId}
          originEpisodeId={transition.originEpisodeId}
          episodeCondition={originEpisode?.condition ?? "Unknown"}
          originPhysioName={originPhysio?.name ?? "Unknown"}
          destinationPhysioName={destinationPhysioName}
          currentConsent={existingConsent ?? null}
        />
      </div>
    );
  }

  if (!episodeId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Patient Consent
          </h1>
          <p className="mt-4 text-slate-600">No episode specified</p>
        </div>
      </div>
    );
  }

  // Fetch episode data
  const [episodeData] = await db
    .select({
      episode: episodes,
      physio: physiotherapists,
    })
    .from(episodes)
    .leftJoin(physiotherapists, eq(episodes.physioId, physiotherapists.id))
    .where(and(eq(episodes.id, episodeId), eq(episodes.patientId, patientId)));

  if (!episodeData || !episodeData.physio) {
    notFound();
  }

  const { episode, physio } = episodeData;

  // Fetch consent
  const [consent] = await db
    .select()
    .from(consents)
    .where(
      and(
        eq(consents.episodeId, episodeId),
        eq(consents.patientId, patientId)
      )
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/physio/${physio.id}/episodes/${episodeId}`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Episode
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Manage Episode Consent
        </h1>
        <p className="mt-2 text-slate-600">{patient.name}</p>
        <p className="text-sm text-slate-500">
          Episode: {episode.condition} with {physio.name}
        </p>
      </div>

      <ConsentForm
        patientId={patientId}
        episodeId={episodeId}
        physioId={physio.id}
        currentConsent={consent || null}
        episodeCondition={episode.condition}
        physioName={physio.name}
      />
    </div>
  );
}
