import { db } from "@/db";
import { physiotherapists, episodes, consents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
import { OptInBanner } from "@/components/physio/opt-in-banner";
import { PageHeader } from "@/components/physio/page-header";
import {
  Activity,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
}

export default async function PhysioDashboardPage({ params }: Props) {
  const { physioId } = await params;

  // Fetch physiotherapist data
  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // Fetch episodes count
  const physioEpisodes = await db
    .select()
    .from(episodes)
    .where(eq(episodes.physioId, physioId))
    .orderBy(desc(episodes.startedAt))
    .limit(5);

  const totalEpisodes = await db
    .select()
    .from(episodes)
    .where(eq(episodes.physioId, physioId));

  const gpReferredCount = totalEpisodes.filter((e) => e.isGpReferred).length;

  // Fetch consents count
  const grantedConsents = await db
    .select()
    .from(consents)
    .where(
      and(eq(consents.physioId, physioId), eq(consents.status, "granted"))
    );

  const consentRate =
    totalEpisodes.length > 0
      ? Math.round((grantedConsents.length / totalEpisodes.length) * 100)
      : 0;

  return (
    <div className="px-6 py-8">
      <PageHeader
        physioName={physio.name}
        physioId={physioId}
        previewMode={physio.previewMode}
        title="Dashboard"
        description={`${physio.clinicName} • ${physio.region}`}
      />

      {/* Opt-in Banner for non-opted-in users */}
      {!physio.optedIn && (
        <div className="mb-8">
          <OptInBanner physioId={physioId} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Episodes
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEpisodes.length}</div>
            <p className="text-xs text-slate-500">
              {gpReferredCount} GP-referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Patient Consent Rate
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consentRate}%</div>
            <p className="text-xs text-slate-500">
              {grantedConsents.length} of {totalEpisodes.length} episodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Signal Status
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {physio.optedIn ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-slate-500">
              {physio.optedIn
                ? "Signals are computed"
                : "Opt in to compute signals"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Referral Eligibility
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {physio.optedIn ? "Simulated" : "0"}
            </div>
            <p className="text-xs text-slate-500">
              {physio.optedIn
                ? "View eligibility details"
                : "Opt in to appear in sets"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href={`/physio/${physioId}/episodes`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Episodes</CardTitle>
              <CardDescription>
                View all episodes and visit timelines
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/physio/${physioId}/signals`}>
          <Card
            className={`transition-shadow hover:shadow-md ${
              !physio.optedIn ? "opacity-50" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-base">Signals</CardTitle>
              <CardDescription>
                {physio.optedIn
                  ? "View your quality signals"
                  : "Opt in to see signals"}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/physio/${physioId}/eligibility`}>
          <Card
            className={`transition-shadow hover:shadow-md ${
              !physio.optedIn ? "opacity-50" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-base">Eligibility</CardTitle>
              <CardDescription>
                {physio.optedIn
                  ? "See referral set membership"
                  : "Opt in to check eligibility"}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Episodes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Episodes</CardTitle>
            <Link href={`/physio/${physioId}/episodes`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {physioEpisodes.length === 0 ? (
            <p className="text-sm text-slate-500">No episodes yet</p>
          ) : (
            <div className="space-y-3">
              {physioEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/physio/${physioId}/episodes/${episode.id}`}
                >
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">
                        {episode.condition}
                      </p>
                      <p className="text-sm text-slate-500">
                        Started {formatDate(episode.startedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {episode.isGpReferred && (
                        <Badge variant="secondary">GP Referred</Badge>
                      )}
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
