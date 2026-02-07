import { db } from "@/db";
import {
  physiotherapists,
  episodes,
  patients,
  visits,
  consents,
  gps,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCheck, UserX } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EpisodeTimeline } from "@/components/physio/episode-timeline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string; episodeId: string }>;
}

export default async function EpisodeDetailPage({ params }: Props) {
  const { physioId, episodeId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // Fetch episode data
  const [episodeData] = await db
    .select({
      episode: episodes,
      patient: patients,
      gp: gps,
    })
    .from(episodes)
    .leftJoin(patients, eq(episodes.patientId, patients.id))
    .leftJoin(gps, eq(episodes.referringGpId, gps.id))
    .where(eq(episodes.id, episodeId));

  if (!episodeData || episodeData.episode.physioId !== physioId) {
    notFound();
  }

  const { episode, patient, gp } = episodeData;

  // Fetch visits
  const episodeVisits = await db
    .select()
    .from(visits)
    .where(eq(visits.episodeId, episodeId))
    .orderBy(visits.visitNumber);

  // Fetch consent
  const [consent] = await db
    .select()
    .from(consents)
    .where(
      and(
        eq(consents.episodeId, episodeId),
        eq(consents.patientId, episode.patientId)
      )
    );

  return (
    <div className="px-6 py-8">
      {/* Episode Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {episode.condition}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <span>{patient?.name}</span>
              <span>•</span>
              <span>Started {formatDate(episode.startedAt)}</span>
              {episode.dischargedAt && (
                <>
                  <span>•</span>
                  <span>Discharged {formatDate(episode.dischargedAt)}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={episode.status === "active" ? "default" : "outline"}>
            {episode.status}
          </Badge>
        </div>
      </div>

      {/* Episode Info Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral Information</CardTitle>
          </CardHeader>
          <CardContent>
            {episode.isGpReferred && gp ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">GP Referred</Badge>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{gp.name}</p>
                  <p className="text-slate-600">{gp.practiceName}</p>
                  <p className="text-slate-500">{gp.region}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                <p>Self-referred or direct booking</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Consent</CardTitle>
          </CardHeader>
          <CardContent>
            {consent && consent.status === "granted" ? (
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Consent Granted</p>
                  <p className="text-sm text-green-700">
                    Granted {formatDate(consent.grantedAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700">No Consent</p>
                  <p className="text-sm text-slate-500">
                    This episode does not contribute to signals
                  </p>
                </div>
              </div>
            )}
            <Link
              href={`/patient/${episode.patientId}/consent?episode=${episodeId}`}
              className="mt-3 block"
            >
              <Button variant="outline" size="sm" className="w-full">
                Manage Consent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Visit Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Timeline</CardTitle>
          <CardDescription>
            {episodeVisits.length} visit{episodeVisits.length !== 1 ? "s" : ""}{" "}
            recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EpisodeTimeline visits={episodeVisits} />
        </CardContent>
      </Card>
    </div>
  );
}
