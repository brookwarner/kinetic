import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ physioId: string }>;
}

export default async function PreviewOnboardingPage({ params }: Props) {
  const { physioId } = await params;

  // Redirect to the new opt-in wizard which handles the preview flow
  redirect(`/physio/${physioId}/opt-in`);
}
