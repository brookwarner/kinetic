"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { toggleOptIn } from "@/actions/opt-in";
import { AlertCircle, CheckCircle2, Eye, Shield } from "lucide-react";

interface OptInToggleProps {
  physioId: string;
  currentOptInStatus: boolean;
  physioName: string;
}

export function OptInToggle({
  physioId,
  currentOptInStatus,
  physioName,
}: OptInToggleProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptInDialog, setShowOptInDialog] = useState(false);
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);

  const handleOptIn = async () => {
    setIsProcessing(true);
    setShowOptInDialog(false);
    await toggleOptIn(physioId, true);
    // Note: If successful, user will be redirected to preview onboarding
    // If there's an error, it will be thrown and caught by error boundary
  };

  const handleOptOut = async () => {
    setIsProcessing(true);
    setShowOptOutDialog(false);
    await toggleOptIn(physioId, false);
    setIsProcessing(false);
  };

  if (currentOptInStatus) {
    return (
      <>
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">You're Opted In</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Your episode data is being used to compute quality signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2 text-sm text-green-800">
                <p className="font-medium">What this means:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Episodes with patient consent contribute to your signals</li>
                  <li>You appear in GP referral sets (when eligible)</li>
                  <li>You can see detailed signal computations</li>
                  <li>You can opt out at any time</li>
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowOptOutDialog(true)}
                disabled={isProcessing}
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                {isProcessing ? "Processing..." : "Opt Out"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Opt Out of Kinetic?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>Are you sure you want to opt out?</p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-slate-900">What happens:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Your existing data will be preserved but marked inactive</li>
                    <li>You will no longer appear in GP referral sets</li>
                    <li>You can opt back in at any time</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleOptOut}
                className="bg-red-600 hover:bg-red-700"
              >
                Opt Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-slate-900">Not Opted In</CardTitle>
          </div>
          <CardDescription>
            You're currently invisible to the referral system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">All-or-nothing</p>
                  <p className="text-slate-600">
                    Share all episode data (with patient consent) or none. No
                    cherry-picking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-900">Preview mode first</p>
                  <p className="text-slate-600">
                    See exactly what signals are computed before going live.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Reversible</p>
                  <p className="text-slate-600">
                    Opt out any time. Your data stays but becomes inactive.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowOptInDialog(true)}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Opt In to Kinetic"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showOptInDialog} onOpenChange={setShowOptInDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opt In to Kinetic</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                By opting in, you agree to share all episode data (with patient consent)
                for signal computation. You cannot selectively share data.
              </p>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">
                  You'll start in Preview Mode
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  See how signals are computed before going live. You can exit preview
                  mode when you're ready.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOptIn}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
