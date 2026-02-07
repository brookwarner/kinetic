import { Circle } from "lucide-react";

interface ConfidenceIndicatorProps {
  value: number; // 0-100
  confidence: "low" | "medium" | "high";
  label: string;
}

export function ConfidenceIndicator({
  value,
  confidence,
  label,
}: ConfidenceIndicatorProps) {
  // Determine how many dots to fill (0-3)
  let filledDots = 0;
  if (value >= 70 && confidence !== "low") {
    filledDots = 3; // All three filled
  } else if (value >= 50 && confidence === "high") {
    filledDots = 2; // Two filled
  } else if (value >= 40 || confidence === "medium") {
    filledDots = 1; // One filled
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-600">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`h-2 w-2 rounded-full ${
              dot <= filledDots ? "bg-blue-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
