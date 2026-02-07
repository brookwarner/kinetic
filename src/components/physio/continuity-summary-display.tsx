import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Stethoscope,
  Activity,
  BarChart3,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";

interface ContinuitySummaryDisplayProps {
  conditionFraming: string;
  diagnosisHypothesis: string;
  interventionsAttempted: string[];
  responseProfile: { responded: string[]; didNotRespond: string[] };
  currentStatus: string;
  openConsiderations: string[];
  physioAnnotations?: string | null;
  showAnnotations?: boolean;
}

export function ContinuitySummaryDisplay({
  conditionFraming,
  diagnosisHypothesis,
  interventionsAttempted,
  responseProfile,
  currentStatus,
  openConsiderations,
  physioAnnotations,
  showAnnotations = true,
}: ContinuitySummaryDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Condition Framing */}
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-sm font-semibold text-teal-900">
              Condition Framing
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{conditionFraming}</p>
        </CardContent>
      </Card>

      {/* Diagnosis Hypothesis */}
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-sm font-semibold text-teal-900">
              Working Hypothesis
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{diagnosisHypothesis}</p>
        </CardContent>
      </Card>

      {/* Interventions Attempted */}
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-sm font-semibold text-teal-900">
              Interventions Attempted
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {interventionsAttempted.map((intervention, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                {intervention}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Response Profile */}
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-sm font-semibold text-teal-900">
              Response Profile
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {responseProfile.responded.length > 0 && (
            <div>
              <Badge
                variant="outline"
                className="mb-2 border-green-200 bg-green-50 text-green-700"
              >
                Responded
              </Badge>
              <ul className="space-y-1">
                {responseProfile.responded.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {responseProfile.didNotRespond.length > 0 && (
            <div>
              <Badge
                variant="outline"
                className="mb-2 border-amber-200 bg-amber-50 text-amber-700"
              >
                Did Not Respond
              </Badge>
              <ul className="space-y-1">
                {responseProfile.didNotRespond.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card className="border-teal-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-sm font-semibold text-teal-900">
              Current Status
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{currentStatus}</p>
        </CardContent>
      </Card>

      {/* Open Considerations */}
      <Card className="border-amber-100 bg-amber-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-sm font-semibold text-amber-900">
              Open Considerations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {openConsiderations.map((consideration, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                {consideration}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Physio Annotations */}
      {showAnnotations && physioAnnotations && (
        <Card className="border-purple-100 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900">
              Physiotherapist Annotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-slate-700">{physioAnnotations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
