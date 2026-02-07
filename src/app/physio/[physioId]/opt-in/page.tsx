import { db } from "@/db";
import { physiotherapists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OptInWizard } from "./opt-in-wizard";
import { SettingsView } from "./settings-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ physioId: string }>;
  searchParams: Promise<{ wizard?: string }>;
}

export default async function OptInSettingsPage({ params, searchParams }: Props) {
  const { physioId } = await params;
  const { wizard } = await searchParams;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  // If wizard=true in URL, always show wizard (prevents premature switch to settings during flow)
  if (wizard === "true") {
    return <OptInWizard physioId={physioId} />;
  }

  // If not opted in, show the wizard
  if (!physio.optedIn) {
    return <OptInWizard physioId={physioId} />;
  }

  // If opted in, show settings view
  return (
    <SettingsView
      physioId={physioId}
      previewMode={physio.previewMode}
      optedInAt={physio.optedInAt}
    />
  );
}
