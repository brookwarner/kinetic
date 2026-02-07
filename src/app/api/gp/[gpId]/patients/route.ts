import { db } from "@/db";
import { gps, patients, gpPatientNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gpId: string }> }
) {
  const { gpId } = await params;

  // Verify GP exists
  const [gp] = await db.select().from(gps).where(eq(gps.id, gpId));

  if (!gp) {
    return NextResponse.json({ error: "GP not found" }, { status: 404 });
  }

  // Get all patients from the GP's region
  const regionPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.region, gp.region));

  // Get GP patient notes for this GP
  const notes = await db
    .select()
    .from(gpPatientNotes)
    .where(eq(gpPatientNotes.gpId, gpId));

  // Create a map of patient IDs to notes
  const notesMap = new Map(notes.map((n) => [n.patientId, n.notes]));

  // Combine patient data with notes
  const patientsWithNotes = regionPatients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    region: patient.region,
    notes: notesMap.get(patient.id) || null,
  }));

  // Sort to show patients with notes first
  patientsWithNotes.sort((a, b) => {
    if (a.notes && !b.notes) return -1;
    if (!a.notes && b.notes) return 1;
    return 0;
  });

  return NextResponse.json({ patients: patientsWithNotes });
}
