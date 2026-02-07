import { db } from "@/db";
import { physiotherapists } from "@/db/schema";
import { eq } from "drizzle-orm";
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
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  Inbox,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/physio/page-header";
import { EligibilityMeter } from "@/components/physio/eligibility-meter";
import { simulateEligibility } from "@/lib/eligibility/simulate";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
}

export default async function ReferralsPage({ params }: Props) {
  const { physioId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // Simulate eligibility for the "What's in it for me?" section
  const eligibility = await simulateEligibility(physioId);

  // TODO: In production, fetch actual GP referrals from database
  // For MVP demo, show empty state
  const referrals: any[] = [];

  return (
    <div className="px-6 py-8">
      <PageHeader
        physioName={physio.name}
        physioId={physioId}
        previewMode={physio.previewMode}
        title="GP Referrals"
        description={
          physio.optedIn
            ? "Patient referrals from GP practices in your network"
            : "Start receiving quality patient referrals from GP practices"
        }
      />

      {/* Empty State - Not Opted In */}
      {!physio.optedIn && (
        <>
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                No Referrals Yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                You're not receiving GP referrals because you haven't opted into
                the Kinetic referral network.
              </p>
            </CardContent>
          </Card>

          {/* What's in it for me? - Opt-in Upsell */}
          <Card className="border-2 border-[hsl(var(--kinetic-wine)/0.2)] bg-gradient-to-br from-[hsl(var(--kinetic-peach))] to-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                <CardTitle className="text-[hsl(var(--kinetic-wine))]">
                  Your Opportunity
                </CardTitle>
              </div>
              <CardDescription>
                See what you could gain by joining the Kinetic network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big Number */}
              <div className="text-center">
                <div className="text-6xl font-extrabold text-[hsl(var(--kinetic-wine))]">
                  {eligibility.eligibleReferralSets}
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  GP Practice{eligibility.eligibleReferralSets !== 1 ? "s" : ""} Ready
                  to Refer
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Based on your {physio.region} location and current practice
                  quality
                </p>
              </div>

              {/* What You Get */}
              <div className="space-y-3 rounded-lg bg-white/80 p-4">
                <p className="font-medium text-slate-900">
                  By opting in, you'll:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <p className="text-sm text-slate-700">
                      <strong>Appear in {eligibility.eligibleReferralSets} GP referral sets</strong> when they refer patients in {physio.region}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <p className="text-sm text-slate-700">
                      <strong>Receive quality-matched referrals</strong> based on your
                      clinical outcomes
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <p className="text-sm text-slate-700">
                      <strong>Build stronger signals</strong> as more GP-referred
                      patients grant consent
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <p className="text-sm text-slate-700">
                      <strong>Preview before going live</strong> - verify your signals
                      with full transparency
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href={`/physio/${physioId}/opt-in`}>
                <Button
                  size="lg"
                  className="btn-kinetic w-full text-white"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Receiving Referrals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <p className="text-center text-xs text-slate-500">
                No commitment required • Opt out anytime • Preview mode available
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State - Opted In but no referrals yet (MVP) */}
      {physio.optedIn && referrals.length === 0 && (
        <>
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                You're All Set!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                You're visible in {eligibility.eligibleReferralSets} GP referral set
                {eligibility.eligibleReferralSets !== 1 ? "s" : ""}. Referrals will
                appear here as GPs refer patients to you.
              </p>
            </CardContent>
          </Card>

          {/* Show current eligibility status */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Network</CardTitle>
              <CardDescription>
                GP practices that can refer patients to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EligibilityMeter
                eligible={eligibility.eligibleReferralSets}
                total={eligibility.totalReferralSets}
              />
              <div className="mt-4 text-sm text-slate-600">
                <p>
                  You appear in <strong>{eligibility.eligibleReferralSets} of{" "}
                  {eligibility.totalReferralSets}</strong> GP practice referral sets
                  based on:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    {eligibility.confidenceFactors.regionMatch ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                    Region match ({physio.region})
                  </li>
                  <li className="flex items-center gap-2">
                    {eligibility.confidenceFactors.outcomeTrajectoryStrong ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                    Strong outcome signals
                  </li>
                  <li className="flex items-center gap-2">
                    {eligibility.confidenceFactors.clinicalDecisionStrong ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                    Strong clinical decision signals
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* TODO: Actual referrals list when they exist */}
      {physio.optedIn && referrals.length > 0 && (
        <div className="space-y-4">
          {/* Referral cards would go here */}
        </div>
      )}
    </div>
  );
}
