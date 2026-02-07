import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

interface SignalCardProps {
  title: string;
  description: string;
  value: number; // 0-100
  confidence: "low" | "medium" | "high";
  episodeCount: number;
}

export function SignalCard({
  title,
  description,
  value,
  confidence,
  episodeCount,
}: SignalCardProps) {
  // Determine directional indicator (NOT showing numeric scores to users)
  // The QUALITY is the dominant element, confidence is secondary context
  let indicator: "positive" | "emerging" | "needs-data";
  let indicatorText: string;
  let indicatorTextColor: string; // Color for the main quality indicator text
  let iconBgColor: string; // Background color for icon
  let iconColor: string; // Icon color
  let Icon: typeof TrendingUp;

  if (value >= 70 && confidence !== "low") {
    indicator = "positive";
    indicatorText = "Positive Trend";
    indicatorTextColor = "text-green-700";
    iconBgColor = "bg-green-50";
    iconColor = "text-green-600";
    Icon = TrendingUp;
  } else if (value >= 50 || confidence === "low") {
    indicator = "emerging";
    indicatorText = confidence === "low" ? "Building Data" : "Emerging Pattern";
    indicatorTextColor = "text-amber-700";
    iconBgColor = "bg-amber-50";
    iconColor = "text-amber-600";
    Icon = Minus;
  } else {
    indicator = "needs-data";
    indicatorText = "Needs Attention";
    indicatorTextColor = "text-slate-700";
    iconBgColor = "bg-slate-50";
    iconColor = "text-slate-600";
    Icon = TrendingDown;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* DOMINANT: Quality trend in large, colored text */}
          <div>
            <p className={`text-3xl font-bold ${indicatorTextColor}`}>
              {indicatorText}
            </p>
          </div>
          {/* SECONDARY: Confidence and episode count in muted text */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>
              {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
            </span>
            <span>•</span>
            <span>
              {episodeCount} episode{episodeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
