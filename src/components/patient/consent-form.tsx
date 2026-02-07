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
import { Badge } from "@/components/ui/badge";
import { grantConsent, revokeConsent } from "@/actions/consent";
import { CheckCircle2, Shield, Eye, AlertCircle } from "lucide-react";

interface ConsentFormProps {
  patientId: string;
  episodeId: string;
  physioId: string;
  currentConsent: {
    id: string;
    status: "granted" | "revoked";
    grantedAt: Date | null;
    revokedAt: Date | null;
  } | null;
  episodeCondition: string;
  physioName: string;
}

export function ConsentForm({
  patientId,
  episodeId,
  physioId,
  currentConsent,
  episodeCondition,
  physioName,
}: ConsentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const isConsentGranted =
    currentConsent && currentConsent.status === "granted";

  const handleGrant = async () => {
    if (
      !confirm(
        "By granting consent, you allow your episode data to be used for quality signal computation. This helps improve the referral system. Continue?"
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const result = await grantConsent(patientId, episodeId, physioId);
    if (!result.success) {
      alert("Failed to grant consent. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRevoke = async () => {
    if (!currentConsent) return;

    if (
      !confirm(
        "Are you sure you want to revoke consent? Your episode data will no longer be used for quality signals."
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const result = await revokeConsent(currentConsent.id, physioId, episodeId);
    if (!result.success) {
      alert("Failed to revoke consent. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
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
              Your episode data is being used to help improve the referral
              system
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
                Consent Not Granted
              </CardTitle>
            </div>
            <CardDescription>
              Your episode data is not currently being used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGrant} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Grant Consent"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            What does consent mean?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">
                  Episode-specific
                </p>
                <p className="text-slate-600">
                  This consent only applies to your {episodeCondition} episode
                  with {physioName}. Other episodes require separate consent.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">What's shared</p>
                <p className="text-slate-600">
                  Only structured clinical data: visit dates, pain scores,
                  function scores, treatment adjustments, and outcomes. No free
                  text notes or personal details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-slate-900">Revocable</p>
                <p className="text-slate-600">
                  You can withdraw consent at any time. Your data will
                  immediately stop contributing to quality signals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">
            Why does this matter?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800">
            Your consent helps create quality signals that enable GPs to find
            the right physiotherapists for their patients. It's an important
            part of building a transparent, quality-based referral system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
