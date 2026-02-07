"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { disablePreviewMode } from "@/actions/opt-in";
import { useState } from "react";

interface PreviewModeBannerProps {
  physioId: string;
}

export function PreviewModeBanner({ physioId }: PreviewModeBannerProps) {
  const [isDisabling, setIsDisabling] = useState(false);
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);

  const handleDisablePreviewMode = async () => {
    setIsDisabling(true);
    setShowGoLiveDialog(false);
    await disablePreviewMode(physioId);
    // If successful, page will revalidate and banner will disappear
    setIsDisabling(false);
  };

  return (
    <>
      <div className="border-b border-[hsl(var(--kinetic-peach))]/40 bg-[hsl(var(--kinetic-peach))]/20 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-[hsl(var(--kinetic-wine))]" />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Preview Mode Active
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  You can see exactly what signals the system computes. You're not yet visible to GPs. Exit when ready to go live.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGoLiveDialog(true)}
              disabled={isDisabling}
              className="border-[hsl(var(--kinetic-wine))]/30 bg-white hover:bg-[hsl(var(--kinetic-wine))]/5"
            >
              {isDisabling ? "Exiting..." : "Go Live"}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Preview Mode?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to go live?</p>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-slate-900">What happens:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>You will appear in GP referral sets (when eligible)</li>
                  <li>Your quality signals will be visible to GPs</li>
                  <li>Signals will show as confidence dots, not numeric scores</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Preview</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisablePreviewMode}>
              Go Live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
