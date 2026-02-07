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
  grantContinuityConsent,
  revokeContinuityConsent,
} from "@/actions/transitions";
import {
  CheckCircle2,
  Shield,
  FileText,
  AlertCircle,
  ArrowRightLeft,
  Eye,
  XCircle,
} from "lucide-react";

interface ContinuityConsentFormProps {
  patientId: string;
  transitionEventId: string;
  originEpisodeId: string;
  episodeCondition: string;
  originPhysioName: string;
  destinationPhysioName: string | null;
  currentConsent: {
    id: string;
    status: "granted" | "revoked" | "expired";
  } | null;
}

export function ContinuityConsentForm({
  patientId,
  transitionEventId,
  originEpisodeId,
  episodeCondition,
  originPhysioName,
  destinationPhysioName,
  currentConsent,
}: ContinuityConsentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const isConsentGranted =
    currentConsent && currentConsent.status === "granted";

  const handleGrant = async () => {
    setIsProcessing(true);
    const result = await grantContinuityConsent(
      patientId,
      transitionEventId,
      originEpisodeId
    );
    if (!result.success) {
      alert("Failed to grant consent. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRevoke = async () => {
    if (!currentConsent) return;
    setIsProcessing(true);
    const result = await revokeContinuityConsent(currentConsent.id);
    if (!result.success) {
      alert("Failed to revoke consent. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-teal-900">
              Care Transition — Continuity Summary
            </CardTitle>
          </div>
          <CardDescription className="text-teal-700">
            You are transitioning from {originPhysioName}
            {destinationPhysioName
              ? ` to ${destinationPhysioName}`
              : " to a new provider"}
            . A Continuity Summary helps your new physiotherapist understand your
            treatment history.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Status */}
      {isConsentGranted ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">
                Consent Granted
              </CardTitle>
            </div>
            <CardDescription className="text-green-700">
              A Continuity Summary is being prepared for your transition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleRevoke}
              disabled={isProcessing}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {isProcessing ? "Processing..." : "Revoke Consent"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-slate-900">
                Consent Not Yet Granted
              </CardTitle>
            </div>
            <CardDescription>
              Your new provider will not have access to your treatment history
              from {originPhysioName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGrant}
              disabled={isProcessing}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {isProcessing ? "Processing..." : "Grant Consent for Continuity Summary"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* What's in a Continuity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            What is a Continuity Summary?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            A Continuity Summary is a structured clinical handoff document.
            It contains only structured data from your episode — never raw
            clinical notes or personal opinions.
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
              <div>
                <p className="font-medium text-slate-900">What's included</p>
                <ul className="mt-1 list-disc pl-4 text-slate-600">
                  <li>Your condition and treatment duration</li>
                  <li>Interventions that were tried</li>
                  <li>How you responded to treatment</li>
                  <li>Your current status (pain and function scores)</li>
                  <li>Open clinical considerations</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-slate-900">What's excluded</p>
                <ul className="mt-1 list-disc pl-4 text-slate-600">
                  <li>No raw clinical notes or personal opinions</li>
                  <li>No comparison between providers</li>
                  <li>No performance evaluation language</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Your control</p>
                <p className="text-slate-600">
                  This consent is specific to this transition only. You can
                  revoke it at any time, and the summary will be immediately
                  withdrawn from the receiving provider.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">Review process</p>
                <p className="text-slate-600">
                  Your originating physiotherapist ({originPhysioName}) reviews
                  the summary before it's released. They can add context but
                  cannot remove any generated content.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-teal-50">
        <CardHeader>
          <CardTitle className="text-base text-teal-900">
            Why does this matter?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-teal-800">
            Without a Continuity Summary, your new physiotherapist starts from
            scratch. You may need to repeat your history, and treatments that
            have already been tried may be attempted again. This summary helps
            ensure a smooth transition of care.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
