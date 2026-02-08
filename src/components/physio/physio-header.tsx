import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, AlertCircle } from "lucide-react";

interface PhysioHeaderProps {
  physioName: string;
  clinicName: string;
  optedIn: boolean;
  previewMode: boolean;
}

export function PhysioHeader({
  physioName,
  clinicName,
  optedIn,
  previewMode,
}: PhysioHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-col gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Welcome to Kinetic, {physioName}
        </h1>
        <p className="text-sm text-slate-500">{clinicName}</p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        {optedIn ? (
          previewMode ? (
            <Badge className="border-[hsl(var(--kinetic-peach))] bg-[hsl(var(--kinetic-peach)/0.3)] text-[hsl(var(--foreground))]">
              <Eye className="mr-1 h-3 w-3" />
              Preview Mode
            </Badge>
          ) : (
            <Badge className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Live
            </Badge>
          )
        ) : (
          <Badge variant="outline" className="border-slate-400">
            <AlertCircle className="mr-1 h-3 w-3" />
            Not Opted In
          </Badge>
        )}
      </div>
    </header>
  );
}
