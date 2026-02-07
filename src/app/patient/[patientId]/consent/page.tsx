import { db } from "@/db";
import { patients, episodes, consents, physiotherapists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConsentForm } from "@/components/patient/consent-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ episode?: string }>;
}

export default async function PatientConsentPage({
  params,
  searchParams,
}: Props) {
  const { patientId } = await params;
  const { episode: episodeId } = await searchParams;

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId));

  if (!patient) {
    notFound();
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
