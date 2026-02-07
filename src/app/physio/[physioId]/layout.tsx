import { db } from "@/db";
import { physiotherapists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PhysioSidebar } from "@/components/physio/physio-sidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ physioId: string }>;
}

export default async function PhysioLayout({ children, params }: LayoutProps) {
  const { physioId } = await params;

  const [physio] = await db
    .select()
    .from(physiotherapists)
    .where(eq(physiotherapists.id, physioId));

  if (!physio) {
    notFound();
  }

  return (
    <div className="physio-mode min-h-screen bg-background">
      <PhysioSidebar physioId={physioId} />

      <div className="ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
