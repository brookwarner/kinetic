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
import { Badge } from "@/components/ui/badge";
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
import {
  CheckCircle2,
  Eye,
  Loader2,
  LogOut,
  Rocket,
  Settings,
  Shield,
} from "lucide-react";
import { toggleOptIn, disablePreviewMode } from "@/actions/opt-in";
import { formatDate } from "@/lib/utils";

interface SettingsViewProps {
  physioId: string;
  previewMode: boolean;
  optedInAt: Date | null;
}

export function SettingsView({
  physioId,
  previewMode,
  optedInAt,
}: SettingsViewProps) {
  const router = useRouter();
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);
  const [isOptingOut, setIsOptingOut] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);

  const handleOptOut = async () => {
    setIsOptingOut(true);
    setShowOptOutDialog(false);
    await toggleOptIn(physioId, false);
    router.push(`/physio/${physioId}`);
  };

  const handleGoLive = async () => {
    setIsGoingLive(true);
    setShowGoLiveDialog(false);
    await disablePreviewMode(physioId);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-[hsl(var(--kinetic-wine))]" />
          <h1 className="text-2xl font-bold text-slate-900">
            Opt-In Settings
          </h1>
        </div>
        <p className="mt-2 text-slate-600">
          Manage your data sharing preferences and visibility settings
        </p>
      </div>

      {/* Current Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Status</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-green-600">Opted In</Badge>
              {previewMode && (
                <Badge variant="outline" className="border-amber-400 text-amber-700">
                  Preview Mode
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Your current participation status in the Kinetic network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-slate-900">Data Sharing Active</p>
              <p className="text-sm text-slate-600">
                Your consented episode data contributes to quality signal computation
              </p>
              {optedInAt && (
                <p className="mt-1 text-xs text-slate-400">
                  Opted in on {formatDate(optedInAt)}
                </p>
              )}
            </div>
          </div>

          {previewMode ? (
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-slate-900">Preview Mode Active</p>
                <p className="text-sm text-slate-600">
                  You can see your signals, but GPs cannot see you in referral sets yet
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-slate-900">Live and Visible</p>
                <p className="text-sm text-slate-600">
                  GPs can see your quality signals and include you in referral sets
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Mode Action */}
      {previewMode && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Ready to Go Live?</CardTitle>
            <CardDescription className="text-amber-800">
              Exit preview mode to become visible to GPs in referral sets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowGoLiveDialog(true)}
              disabled={isGoingLive}
              className="btn-kinetic w-full text-white"
            >
              {isGoingLive ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Going Live...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Go Live Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All-or-Nothing Reminder */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">All-or-Nothing Rule</p>
              <p className="mt-1 text-sm text-blue-800">
                Your participation includes all consented episode data. You cannot
                selectively share only certain outcomes. This ensures quality signals
                reflect real clinical practice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opt Out Section */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-900">Opt Out</CardTitle>
          <CardDescription>
            You can opt out at any time. Your data will no longer contribute to
            signal computation and you will be removed from GP referral sets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowOptOutDialog(true)}
            disabled={isOptingOut}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            {isOptingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opting Out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Opt Out of Kinetic
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Opt Out Confirmation Dialog */}
      <AlertDialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Opt Out</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to opt out of Kinetic?</p>
              <div className="space-y-2 rounded-lg bg-red-50 p-3">
                <p className="text-sm font-medium text-red-900">
                  What happens when you opt out:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-800">
                  <li>Your data will no longer contribute to signals</li>
                  <li>You will be removed from GP referral sets</li>
                  <li>Your computed signals will be deleted</li>
                </ul>
              </div>
              <p className="text-sm text-slate-600">
                You can opt back in at any time and your signals will be
                recomputed from your consented episodes.
              </p>
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

      {/* Go Live Confirmation Dialog */}
      <AlertDialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Going Live</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You're about to exit preview mode and become visible to GPs in
                referral sets.
              </p>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm text-green-900">
                  GPs will be able to see your quality signals and consider you
                  for patient referrals based on your region and signal strength.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in Preview</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoLive}>Go Live</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
