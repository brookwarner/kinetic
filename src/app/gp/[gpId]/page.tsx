import { db } from "@/db";
import { gps, patients, physiotherapists, gpPatientNotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Activity, MapPin, Plus, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ gpId: string }>;
  searchParams: Promise<{ referral?: string }>;
}

export default async function GPDashboardPage({ params, searchParams }: Props) {
  const { gpId } = await params;
  const { referral } = await searchParams;

  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    notFound();
  }

  // Get patient count in GP's region
  const regionPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.region, gp.region));

  // Get count of patients with notes for this GP
  const patientNotes = await db
    .select()
    .from(gpPatientNotes)
    .where(eq(gpPatientNotes.gpId, gpId));

  // Get available physios in region (opted in, not in preview mode)
  const availablePhysios = await db
    .select()
    .from(physiotherapists)
    .where(
      and(
        eq(physiotherapists.region, gp.region),
        eq(physiotherapists.optedIn, true)
      )
    );

  const livePhysios = availablePhysios.filter((p) => !p.previewMode);

  return (
    <div className="px-6 py-8">
      {/* Success banner for completed referral */}
      {referral === "success" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Referral Sent Successfully</p>
              <p className="text-sm text-green-700">
                The physiotherapist has been notified and will contact the patient.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{gp.name}</h1>
        <p className="mt-1 text-slate-600">
          {gp.practiceName} • {gp.region}
        </p>
      </div>

      {/* Hero CTA Card */}
      <Card className="mb-8 border-2 border-[hsl(var(--kinetic-sage)/0.3)] bg-gradient-to-br from-[hsl(160_20%_95%)] to-white shadow-lg">
        <CardContent className="py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[hsl(var(--kinetic-sage))]" />
                <span className="text-sm font-medium text-[hsl(var(--kinetic-sage))]">
                  Quality-Based Referrals
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Find the Right Physiotherapist
              </h2>
              <p className="max-w-md text-slate-600">
                Match your patients with physiotherapists based on quality signals,
                capacity, and location — not rankings or sponsorship.
              </p>
            </div>
            <Link href={`/gp/${gpId}/referral/new`}>
              <Button size="lg" className="btn-gp text-white">
                <Plus className="mr-2 h-5 w-5" />
                New Referral
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Patients in Region
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionPatients.length}</div>
            <p className="text-xs text-slate-500">
              {patientNotes.length} with clinical notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Available Physios
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{livePhysios.length}</div>
            <p className="text-xs text-slate-500">
              Opted in and ready for referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Your Region
            </CardTitle>
            <MapPin className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gp.region}</div>
            <p className="text-xs text-slate-500">
              Quality-filtered physiotherapists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>How Kinetic Works</CardTitle>
          <CardDescription>
            Quality-based physiotherapist discovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Sets, Not Rankings</h3>
              <p className="text-sm text-slate-600">
                You see eligible physios in a grid, not a ranked list. This prevents
                unhealthy competition and lets you make the best choice for your patient.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Quality Indicators</h3>
              <p className="text-sm text-slate-600">
                Confidence dots show signal strength, not numeric scores. Focus on
                quality patterns without obsessing over precise rankings.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Capacity Visibility</h3>
              <p className="text-sm text-slate-600">
                See which physiotherapists are available now, have limited slots,
                or are on a waitlist — so you can set patient expectations.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Your Choice</h3>
              <p className="text-sm text-slate-600">
                You decide who to refer to based on patient needs. Kinetic provides
                the information; you make the clinical decision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
