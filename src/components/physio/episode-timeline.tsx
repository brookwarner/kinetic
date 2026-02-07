import { Visit } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AlertCircle, ArrowDown, ArrowUp, Settings } from "lucide-react";

interface EpisodeTimelineProps {
  visits: Visit[];
}

export function EpisodeTimeline({ visits }: EpisodeTimelineProps) {
  if (visits.length === 0) {
    return (
      <p className="text-sm text-slate-500">No visits recorded for this episode</p>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit, index) => {
        const isFirst = index === 0;
        const isLast = index === visits.length - 1;

        return (
          <div key={visit.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 h-full w-0.5 bg-slate-200" />
            )}

            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {visit.visitNumber}
              </div>

              {/* Visit content */}
              <div className="flex-1 rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      Visit {visit.visitNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(visit.visitDate)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {visit.escalated && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Escalated
                      </Badge>
                    )}
                    {visit.treatmentAdjusted && (
                      <Badge variant="secondary" className="text-xs">
                        <Settings className="mr-1 h-3 w-3" />
                        Treatment Adjusted
                      </Badge>
                    )}
                  </div>
                </div>

                {visit.notesSummary && (
                  <p className="mt-2 text-sm text-slate-600">
                    {visit.notesSummary}
                  </p>
                )}

                {/* Scores */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {visit.painScore !== null && (
                    <div className="rounded-md bg-slate-50 p-2">
                      <p className="text-xs font-medium text-slate-600">
                        Pain Score
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">
                          {visit.painScore}/10
                        </p>
                        {index > 0 &&
                          visits[index - 1].painScore !== null && (
                            <div>
                              {visit.painScore < visits[index - 1].painScore! ? (
                                <ArrowDown className="h-4 w-4 text-green-600" />
                              ) : visit.painScore >
                                visits[index - 1].painScore! ? (
                                <ArrowUp className="h-4 w-4 text-red-600" />
                              ) : null}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  {visit.functionScore !== null && (
                    <div className="rounded-md bg-slate-50 p-2">
                      <p className="text-xs font-medium text-slate-600">
                        Function Score
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">
                          {visit.functionScore}/100
                        </p>
                        {index > 0 &&
                          visits[index - 1].functionScore !== null && (
                            <div>
                              {visit.functionScore >
                              visits[index - 1].functionScore! ? (
                                <ArrowUp className="h-4 w-4 text-green-600" />
                              ) : visit.functionScore <
                                visits[index - 1].functionScore! ? (
                                <ArrowDown className="h-4 w-4 text-red-600" />
                              ) : null}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
