import { db } from "@/db";
import { physiotherapists, episodes, patients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PageHeader } from "@/components/physio/page-header";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
}

export default async function EpisodesPage({ params }: Props) {
  const { physioId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // Fetch all episodes for this physio with patient names
  const allEpisodes = await db
    .select({
      episode: episodes,
      patient: patients,
    })
    .from(episodes)
    .leftJoin(patients, eq(episodes.patientId, patients.id))
    .where(eq(episodes.physioId, physioId))
    .orderBy(desc(episodes.startedAt));

  const gpReferredEpisodes = allEpisodes.filter(
    (e) => e.episode.isGpReferred
  );

  return (
    <div className="px-6 py-8">
      <PageHeader
        physioName={physio.name}
        physioId={physioId}
        previewMode={physio.previewMode}
        title="Patients"
        description={`${allEpisodes.length} total episodes • ${gpReferredEpisodes.length} GP-referred`}
      />

      {/* Filter stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {allEpisodes.filter((e) => e.episode.status === "active").length}
              </p>
              <p className="text-sm text-slate-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {
                  allEpisodes.filter((e) => e.episode.status === "discharged")
                    .length
                }
              </p>
              <p className="text-sm text-slate-600">Discharged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {gpReferredEpisodes.length}
              </p>
              <p className="text-sm text-slate-600">GP-Referred</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {
                  allEpisodes.filter(
                    (e) => e.episode.status === "self-discharged"
                  ).length
                }
              </p>
              <p className="text-sm text-slate-600">Self-Discharged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Episodes list */}
      <Card>
        <CardHeader>
          <CardTitle>All Episodes</CardTitle>
          <CardDescription>Click an episode to view details</CardDescription>
        </CardHeader>
        <CardContent>
          {allEpisodes.length === 0 ? (
            <p className="text-sm text-slate-500">No episodes yet</p>
          ) : (
            <div className="space-y-3">
              {allEpisodes.map(({ episode, patient }) => (
                <Link
                  key={episode.id}
                  href={`/physio/${physioId}/episodes/${episode.id}`}
                >
                  <div
                    className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50 ${
                      episode.isGpReferred ? "border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {episode.condition}
                        </p>
                        {episode.isGpReferred && (
                          <Badge variant="secondary" className="text-xs">
                            GP Referred
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                        <span>{patient?.name || "Unknown Patient"}</span>
                        <span>•</span>
                        <span>Started {formatDate(episode.startedAt)}</span>
                        {episode.dischargedAt && (
                          <>
                            <span>•</span>
                            <span>
                              Discharged {formatDate(episode.dischargedAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant={
                          episode.status === "active" ? "default" : "outline"
                        }
                      >
                        {episode.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
