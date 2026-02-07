import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceIndicator } from "./confidence-indicator";
import { Physiotherapist, ComputedSignal } from "@/db/schema";

interface PhysioSetCardProps {
  physio: Physiotherapist;
  signals: {
    outcome?: ComputedSignal;
    clinical?: ComputedSignal;
    preference?: ComputedSignal;
  };
}

export function PhysioSetCard({ physio, signals }: PhysioSetCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base">{physio.name}</CardTitle>
        <p className="text-sm text-slate-600">{physio.clinicName}</p>
        <p className="text-xs text-slate-500">{physio.region}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {physio.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-slate-700">
            Quality Indicators
          </p>

          {signals.outcome && (
            <ConfidenceIndicator
              value={signals.outcome.value}
              confidence={signals.outcome.confidence}
              label="Outcomes"
            />
          )}

          {signals.clinical && (
            <ConfidenceIndicator
              value={signals.clinical.value}
              confidence={signals.clinical.confidence}
              label="Clinical"
            />
          )}

          {signals.preference && (
            <ConfidenceIndicator
              value={signals.preference.value}
              confidence={signals.preference.confidence}
              label="Preference"
            />
          )}

          {!signals.outcome && !signals.clinical && !signals.preference && (
            <p className="text-xs text-slate-500">No signals available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
