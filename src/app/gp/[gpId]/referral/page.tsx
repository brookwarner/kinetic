import { db } from "@/db";
import { gps, physiotherapists, computedSignals } from "@/db/schema";
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
import { ArrowLeft } from "lucide-react";
import { PhysioSetCard } from "@/components/gp/physio-set-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ gpId: string }>;
}

export default async function GPReferralPage({ params }: Props) {
  const { gpId } = await params;

  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    notFound();
  }

  // Fetch physiotherapists in the same region who are opted in and NOT in preview mode
  const physios = await db
    .select()
    .from(physiotherapists)
    .where(
      and(
        eq(physiotherapists.region, gp.region),
        eq(physiotherapists.optedIn, true),
        eq(physiotherapists.previewMode, false) // Only live physios
      )
    );

  // Fetch signals for each physio
  const physiosWithSignals = await Promise.all(
    physios.map(async (physio) => {
      const signals = await db
        .select()
        .from(computedSignals)
        .where(eq(computedSignals.physioId, physio.id));

      return {
        physio,
        signals: {
          outcome: signals.find((s) => s.signalType === "outcome-trajectory"),
          clinical: signals.find((s) => s.signalType === "clinical-decision"),
          preference: signals.find((s) => s.signalType === "patient-preference"),
        },
      };
    })
  );

  // Filter to only those who meet eligibility criteria
  // (at least 2 out of 3 signals with value >= 60 and not low confidence)
  const eligiblePhysios = physiosWithSignals.filter(({ signals }) => {
    const hasStrongOutcome =
      signals.outcome &&
      signals.outcome.value >= 60 &&
      signals.outcome.confidence !== "low";
    const hasStrongClinical =
      signals.clinical &&
      signals.clinical.value >= 60 &&
      signals.clinical.confidence !== "low";
    const hasStrongPreference = signals.preference && signals.preference.value >= 50;

    const strongCount =
      (hasStrongOutcome ? 1 : 0) +
      (hasStrongClinical ? 1 : 0) +
      (hasStrongPreference ? 1 : 0);

    return strongCount >= 2;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/gp/${gpId}`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Physiotherapist Referral Set
        </h1>
        <p className="mt-2 text-slate-600">
          Eligible physiotherapists in {gp.region}
        </p>
      </div>

      {/* Important Note */}
      <Card className="mb-8 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-blue-900">
            This is a <strong>set</strong>, not a ranked list
          </p>
          <p className="mt-1 text-sm text-blue-800">
            All physiotherapists shown meet quality thresholds. They appear in a
            grid with confidence indicators (dots), not numeric scores. You
            choose who to refer to based on patient needs and specialty match.
          </p>
        </CardContent>
      </Card>

      {/* Referral Set Grid */}
      {eligiblePhysios.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Eligible Physiotherapists</CardTitle>
            <CardDescription>
              No physiotherapists in {gp.region} currently meet the quality
              thresholds for referral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              This could mean:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>No physiotherapists have opted in to Kinetic yet</li>
              <li>Opted-in physiotherapists are still in preview mode</li>
              <li>Quality signals are still building confidence</li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {eligiblePhysios.length} eligible physiotherapist
              {eligiblePhysios.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eligiblePhysios.map(({ physio, signals }) => (
              <PhysioSetCard key={physio.id} physio={physio} signals={signals} />
            ))}
          </div>

          <Card className="mt-8 border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">
                Understanding Quality Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <span>Strong positive signal with high confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span>Moderate signal or medium confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span>Emerging signal or building data</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Outcomes = Patient pain/function improvements • Clinical =
                Escalation timing and treatment adjustments • Preference = Patient
                choice and retention
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
