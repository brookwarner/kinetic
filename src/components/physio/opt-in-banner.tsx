"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Shield,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OptInBannerProps {
  physioId: string;
  projectedReferrals?: number;
}

interface FAQItem {
  question: string;
  answer: string;
  category: "benefit" | "objection";
}

const faqItems: FAQItem[] = [
  // Benefits
  {
    question: "How many extra referrals could I receive?",
    answer:
      "Based on your region and patient load, you could appear in multiple GP referral sets. The exact number depends on your quality signals and regional GP coverage. Start with Preview to see your projected eligibility.",
    category: "benefit",
  },
  {
    question: "What do GPs see about me?",
    answer:
      "GPs see directional indicators (e.g., 'Positive Trend', 'Building Data') and confidence levels—never numeric scores. They also see your specialties, clinic name, and region. This focuses on quality patterns, not rankings.",
    category: "benefit",
  },
  {
    question: "How do quality signals help my patients?",
    answer:
      "When GPs can identify physiotherapists with strong outcome patterns, patients get matched to providers who excel in their specific condition. This creates better outcomes and reduces trial-and-error referrals.",
    category: "benefit",
  },
  // Objections
  {
    question: "What happens to my patient data?",
    answer:
      "Only structured clinical data (pain scores, function scores, visit counts) from episodes with patient consent is analyzed. Free-text notes are never accessed. Data stays within Kinetic and is only used to compute quality signals.",
    category: "objection",
  },
  {
    question: "What if my scores are lower than expected?",
    answer:
      "Preview Mode lets you see your signals before going live. Many factors affect signals—case complexity, patient population, specialty focus. The system accounts for this with confidence indicators. You can always stay in preview until you're comfortable.",
    category: "objection",
  },
  {
    question: "How much time does this require?",
    answer:
      "Zero additional time. Kinetic analyzes data that already exists in your episode records. No new documentation, no extra forms, no changes to your workflow.",
    category: "objection",
  },
  {
    question: "Can I opt out later?",
    answer:
      "Yes, you can opt out at any time. Your existing data is preserved but becomes inactive. You won't appear in referral sets, and you can opt back in whenever you choose.",
    category: "objection",
  },
];

export function OptInBanner({ physioId, projectedReferrals }: OptInBannerProps) {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showAllFaq, setShowAllFaq] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleStartPreview = () => {
    router.push(`/physio/${physioId}/opt-in`);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const displayedFaqs = showAllFaq ? faqItems : faqItems.slice(0, 4);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-[hsl(var(--kinetic-wine)/0.2)] bg-gradient-to-br from-white to-[hsl(var(--kinetic-peach)/0.15)]">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl text-[hsl(var(--kinetic-wine))]">
                Unlock GP Referrals
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Preview your signals and understand how GP referrals work.
              </CardDescription>
            </div>
            <DialogTrigger asChild>
              <Button className="btn-kinetic text-white">
                Learn More
              </Button>
            </DialogTrigger>
          </div>
        </CardHeader>
      </Card>

      <DialogContent
        showClose={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="w-[92vw] max-w-5xl border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">Unlock GP Referrals</DialogTitle>
        <Card className="max-h-[85vh] overflow-y-auto border-[hsl(var(--kinetic-wine)/0.2)] bg-gradient-to-br from-white to-[hsl(var(--kinetic-peach)/0.15)]">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-[hsl(var(--kinetic-wine))]">
                  Unlock GP Referrals
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  Join the quality-based referral network and grow your practice
                </CardDescription>
              </div>
              {projectedReferrals !== undefined && projectedReferrals > 0 && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-[hsl(var(--kinetic-wine))]">
                    +{projectedReferrals}
                  </div>
                  <div className="text-sm text-slate-500">
                    potential referrals
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Benefits Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine)/0.1)]">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">More Referrals</p>
                  <p className="text-sm text-slate-500">
                    Appear in GP referral sets
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine)/0.1)]">
                  <Users className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Better Matches</p>
                  <p className="text-sm text-slate-500">
                    Patients matched to your strengths
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine)/0.1)]">
                  <Eye className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Preview First</p>
                  <p className="text-sm text-slate-500">
                    See signals before going live
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine)/0.1)]">
                  <Shield className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Privacy First</p>
                  <p className="text-sm text-slate-500">
                    Only consented data is used
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4 rounded-lg bg-white/50 p-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Ready to explore? Start with Preview Mode
                </p>
                <p className="text-sm text-slate-500">
                  See how your signals are computed before going live
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 px-2 font-normal text-slate-400 shadow-none hover:bg-transparent hover:text-slate-600"
                >
                  Remind me later
                </Button>
                <Button
                  size="lg"
                  onClick={handleStartPreview}
                  className="btn-kinetic shrink-0 text-white"
                >
                  Start Preview
                </Button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Common Questions
              </h3>

              <div className="space-y-2">
                {displayedFaqs.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-white"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="font-medium text-slate-900">
                        {item.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                      )}
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        expandedFaq === index ? "max-h-48" : "max-h-0"
                      )}
                    >
                      <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {faqItems.length > 4 && (
                <button
                  onClick={() => setShowAllFaq(!showAllFaq)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-[hsl(var(--kinetic-wine))] hover:underline"
                >
                  {showAllFaq ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show {faqItems.length - 4} more questions{" "}
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
