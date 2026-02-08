import { db } from "@/db";
import { gps, patients, gpPatientNotes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GpSidebar } from "@/components/gp/gp-sidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ gpId: string }>;
}

export default async function GpLayout({ children, params }: LayoutProps) {
  const { gpId } = await params;

  const [gp] = await db
    .select()
    .from(gps)
    .where(eq(gps.id, gpId));

  if (!gp) {
    notFound();
  }

  // Get GP patient notes to find which patients this GP has seen
  const notes = await db
    .select({ patientId: gpPatientNotes.patientId })
    .from(gpPatientNotes)
    .where(eq(gpPatientNotes.gpId, gpId));

  const patientIdsWithNotes = notes.map((n) => n.patientId);

  // Get patients from the same region as the GP
  const regionPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.region, gp.region));

  // Map patients with notes indicator
  const patientList = regionPatients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    hasNotes: patientIdsWithNotes.includes(patient.id),
  }));

  // Sort to show patients with notes first
  patientList.sort((a, b) => {
    if (a.hasNotes && !b.hasNotes) return -1;
    if (!a.hasNotes && b.hasNotes) return 1;
    return 0;
  });

  return (
    <div className="gp-mode min-h-screen bg-background">
      <GpSidebar gpId={gpId} patients={patientList} />

      <div className="md:ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
