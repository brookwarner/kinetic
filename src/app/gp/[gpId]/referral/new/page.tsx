import { db } from "@/db";
import { gps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NewReferralWizard } from "./new-referral-wizard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ gpId: string }>;
}

export default async function NewReferralPage({ params }: Props) {
  const { gpId } = await params;

  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    notFound();
  }

  return <NewReferralWizard gpId={gpId} gpRegion={gp.region} />;
}
