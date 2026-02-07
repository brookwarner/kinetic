"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { approveSummary, releaseSummary } from "@/actions/summary-review";
import { CheckCircle2, Send, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface SummaryReviewCardProps {
  summaryId: string;
  physioId: string;
  summaryStatus: string;
  existingAnnotations?: string | null;
}

export function SummaryReviewCard({
  summaryId,
  physioId,
  summaryStatus,
  existingAnnotations,
}: SummaryReviewCardProps) {
  const [annotations, setAnnotations] = useState(existingAnnotations ?? "");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsProcessing(true);
    const result = await approveSummary(
      summaryId,
      annotations.trim() || undefined
    );
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to approve summary. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleApproveAndRelease = async () => {
    setIsProcessing(true);

    // If pending-review, approve first
    if (summaryStatus === "pending-review") {
      const approveResult = await approveSummary(
        summaryId,
        annotations.trim() || undefined
      );
      if (!approveResult.success) {
        alert("Failed to approve summary.");
        setIsProcessing(false);
        return;
      }
    }

    const result = await releaseSummary(summaryId);
    if (result.success) {
      router.push(`/physio/${physioId}/handoffs`);
    } else {
      alert("Failed to release summary. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRelease = async () => {
    setIsProcessing(true);
    const result = await releaseSummary(summaryId);
    if (result.success) {
      router.push(`/physio/${physioId}/handoffs`);
    } else {
      alert("Failed to release summary. Please try again.");
    }
    setIsProcessing(false);
  };

  const isPendingReview = summaryStatus === "pending-review";
  const isApproved = summaryStatus === "approved";

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <CardTitle className="text-base">Review Actions</CardTitle>
        <CardDescription>
          Review the generated summary. You can add annotations but cannot
          remove generated content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All-or-nothing reminder */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <p className="text-xs text-slate-600">
            This summary was generated from structured clinical data. You can
            annotate to add context, but the generated content cannot be
            selectively removed — consistent with the all-or-nothing principle.
          </p>
        </div>

        {/* Annotations */}
        <div>
          <label
            htmlFor="annotations"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Annotations (optional)
          </label>
          <Textarea
            id="annotations"
            placeholder="Add any context for the receiving physiotherapist..."
            value={annotations}
            onChange={(e) => setAnnotations(e.target.value)}
            rows={3}
            disabled={isProcessing || (!isPendingReview && !isApproved)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {isPendingReview && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isProcessing}
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Summary</AlertDialogTitle>
                    <AlertDialogDescription>
                      Approving confirms the summary is an accurate
                      representation of this episode. You can then release it
                      separately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isProcessing}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Approve & Release
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve & Release Summary</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will approve and immediately release the Continuity
                      Summary to the receiving physiotherapist. This action
                      shares the summary data with the destination provider.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApproveAndRelease}>
                      Approve & Release
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {isApproved && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isProcessing}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Release to Receiving Physio
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Release Summary</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will release the Continuity Summary to the receiving
                    physiotherapist. They will be able to view the full summary.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRelease}>
                    Release
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
