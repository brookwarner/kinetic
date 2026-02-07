"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, CheckCircle2 } from "lucide-react";

interface SignalData {
  type: string;
  value: number;
  confidence: "low" | "medium" | "high";
}

interface PhysioResultCardProps {
  id: string;
  name: string;
  clinicName: string;
  region: string;
  capacity: "available" | "limited" | "waitlist";
  specialties: string[];
  sameRegion: boolean;
  signals: SignalData[];
  onBeginReferral: () => void;
}

function ConfidenceDots({ signals }: { signals: SignalData[] }) {
  // Show up to 3 dots representing signal strength
  const getSignalLevel = (signal: SignalData) => {
    if (signal.confidence === "low") return 0;
    if (signal.value >= 70) return 2; // Strong
    if (signal.value >= 50) return 1; // Moderate
    return 0;
  };

  const overallLevel = signals.reduce((acc, s) => acc + getSignalLevel(s), 0);
  const dotCount = Math.min(3, Math.ceil(overallLevel / 2));

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i < dotCount
              ? "bg-[hsl(var(--kinetic-sage))]"
              : "bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function CapacityBadge({ capacity }: { capacity: "available" | "limited" | "waitlist" }) {
  const config = {
    available: {
      label: "Available",
      className: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    limited: {
      label: "Limited Availability",
      className: "bg-amber-100 text-amber-700 border-amber-200",
      icon: Clock,
    },
    waitlist: {
      label: "Waitlist",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Clock,
    },
  };

  const { label, className, icon: Icon } = config[capacity];

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

export function PhysioResultCard({
  id,
  name,
  clinicName,
  region,
  capacity,
  specialties,
  sameRegion,
  signals,
  onBeginReferral,
}: PhysioResultCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-600">{clinicName}</p>
        </div>
        <CapacityBadge capacity={capacity} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span className={sameRegion ? "font-medium text-[hsl(var(--kinetic-sage))]" : ""}>
            {sameRegion ? "Same region" : region}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Quality:</span>
          <ConfidenceDots signals={signals} />
        </div>
      </div>

      {specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {specialties.slice(0, 3).map((specialty) => (
            <Badge
              key={specialty}
              variant="secondary"
              className="bg-slate-100 text-slate-600 text-xs"
            >
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 text-xs"
            >
              +{specialties.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Button
          onClick={onBeginReferral}
          className="btn-gp w-full text-white"
        >
          Begin Referral
        </Button>
      </div>
    </div>
  );
}
