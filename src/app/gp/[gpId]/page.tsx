import { db } from "@/db";
import { gps } from "@/db/schema";
import { eq } from "drizzle-orm";
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
import { Users, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ gpId: string }>;
}

export default async function GPDashboardPage({ params }: Props) {
  const { gpId } = await params;

  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{gp.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {gp.practiceName} • {gp.region}
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Your Region
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gp.region}</div>
            <p className="text-xs text-slate-500">
              Physiotherapists in your area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Referral Sets
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-slate-500">
              Quality-based physiotherapist discovery
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Make a Referral</CardTitle>
          <CardDescription>
            Discover physiotherapists through quality-based referral sets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/gp/${gpId}/referral`}>
            <Button>View Referral Sets</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          About Kinetic Referrals
        </h2>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            Kinetic provides quality-based physiotherapist discovery through
            referral sets, not ranked lists.
          </p>
          <p className="font-medium text-slate-700">Key Features:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Sets, not rankings:</strong> You see eligible physios in a
              grid, not a ranked list
            </li>
            <li>
              <strong>Quality indicators:</strong> Confidence dots show signal
              strength, not numeric scores
            </li>
            <li>
              <strong>Region-based:</strong> Only physios in your region appear
            </li>
            <li>
              <strong>GP choice:</strong> You decide who to refer to based on
              patient needs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
