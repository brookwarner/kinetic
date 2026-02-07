import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface EligibilityMeterProps {
  eligible: number;
  total: number;
}

export function EligibilityMeter({ eligible, total }: EligibilityMeterProps) {
  const percentage = total > 0 ? (eligible / total) * 100 : 0;

  let color = "bg-slate-200";
  let textColor = "text-slate-900";
  if (percentage >= 75) {
    color = "bg-green-500";
    textColor = "text-green-900";
  } else if (percentage >= 50) {
    color = "bg-amber-500";
    textColor = "text-amber-900";
  } else if (percentage >= 25) {
    color = "bg-blue-500";
    textColor = "text-blue-900";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="text-5xl font-bold text-slate-900">{eligible}</div>
        <div className="mb-2 text-xl text-slate-600">of {total}</div>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className={`text-sm font-medium ${textColor}`}>
        {percentage === 0 && "Not eligible for any referral sets"}
        {percentage > 0 && percentage < 25 && "Limited eligibility"}
        {percentage >= 25 && percentage < 50 && "Moderate eligibility"}
        {percentage >= 50 && percentage < 75 && "Good eligibility"}
        {percentage >= 75 && "Strong eligibility"}
      </div>
    </div>
  );
}
