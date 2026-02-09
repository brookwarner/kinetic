"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  BookOpen,
  Route,
  Heart,
  Network,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhysioBenchmarkData, BenchmarkCategory } from "@/lib/signals/benchmark-data";

const iconMap: Record<string, typeof Activity> = {
  Activity,
  BookOpen,
  Route,
  Heart,
  Network,
  ShieldCheck,
};

const categoryColors: Record<string, { bg: string; text: string; accent: string }> = {
  "clinical-outcomes": { bg: "bg-green-50", text: "text-green-700", accent: "bg-green-600" },
  "evidence-technique": { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-600" },
  "patient-journey": { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-600" },
  "patient-engagement": { bg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-600" },
  "practice-network": { bg: "bg-teal-50", text: "text-teal-700", accent: "bg-teal-600" },
  "safety-equity": { bg: "bg-slate-50", text: "text-slate-700", accent: "bg-slate-600" },
};

interface BenchmarkDetailPanelProps {
  data: PhysioBenchmarkData;
  defaultExpanded?: boolean;
}

export function BenchmarkDetailPanel({ data, defaultExpanded = false }: BenchmarkDetailPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    defaultExpanded ? data.categories[0]?.id ?? null : null,
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine)/0.1)]">
            <Sparkles className="h-4 w-4 text-[hsl(var(--kinetic-wine))]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
              AI-Powered Benchmark Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Analyzed from {data.episodesAnalyzed} consented episodes · {data.lastAnalyzed}
            </p>
          </div>
        </div>
      </div>

      {/* Overall percentile bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Overall performance</span>
          <span className="font-semibold text-[hsl(var(--kinetic-wine))]">
            {data.overallPercentile}th percentile
          </span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[hsl(var(--kinetic-wine))] transition-all duration-500"
            style={{ width: `${data.overallPercentile}%` }}
          />
          {/* Median marker */}
          <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-400" />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>0th</span>
          <span>50th (median)</span>
          <span>100th</span>
        </div>
      </div>

      {/* Category accordion */}
      <div className="space-y-2">
        {data.categories.map((category) => (
          <CategoryAccordion
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() => toggleCategory(category.id)}
          />
        ))}
      </div>

      {/* Methodology footer */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-3">
            <Brain className="h-5 w-5 shrink-0 text-[hsl(var(--kinetic-wine))]" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                How Kinetic AI analyses your practice
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Clinical notes and structured episode data are analysed using natural
                language processing to extract treatment patterns, outcomes, and clinical
                decisions. Results are compared against anonymised, risk-adjusted benchmarks
                from the Kinetic network using condition-specific percentile scoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Category Accordion ──────────────────────────────────────────────────────

function CategoryAccordion({
  category,
  isExpanded,
  onToggle,
}: {
  category: BenchmarkCategory;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = iconMap[category.iconName] ?? Activity;
  const colors = categoryColors[category.id] ?? categoryColors["clinical-outcomes"];

  const aboveCount = category.signals.filter((s) => s.status === "above").length;
  const atCount = category.signals.filter((s) => s.status === "at").length;
  const belowCount = category.signals.filter((s) => s.status === "below").length;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.text)} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-900">{category.name}</span>
            <div className="mt-0.5 flex items-center gap-2">
              {aboveCount > 0 && (
                <span className="text-[10px] font-medium text-green-600">
                  {aboveCount} above
                </span>
              )}
              {atCount > 0 && (
                <span className="text-[10px] font-medium text-slate-500">
                  {atCount} at median
                </span>
              )}
              {belowCount > 0 && (
                <span className="text-[10px] font-medium text-amber-600">
                  {belowCount} below
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t border-slate-100 px-4 py-3 space-y-4">
          {category.signals.map((signal) => (
            <div key={signal.id} className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{signal.label}</p>
                  <p className="text-xs text-slate-500">{signal.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {signal.yourValue}
                  </p>
                  <p className="text-[10px] text-slate-400">{signal.benchmark}</p>
                </div>
              </div>

              {/* Percentile bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 h-1.5 rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      signal.status === "above"
                        ? "bg-green-500"
                        : signal.status === "at"
                          ? "bg-slate-400"
                          : "bg-amber-500",
                    )}
                    style={{ width: `${signal.percentile}%` }}
                  />
                  {/* Median marker */}
                  <div className="absolute left-1/2 top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-300" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    signal.status === "above"
                      ? "bg-green-50 text-green-700"
                      : signal.status === "at"
                        ? "bg-slate-50 text-slate-600"
                        : "bg-amber-50 text-amber-700",
                  )}
                >
                  {signal.status === "above"
                    ? "Above median"
                    : signal.status === "at"
                      ? "At median"
                      : "Below median"}
                </span>
              </div>

              {/* AI insight */}
              {signal.aiInsight && (
                <p className="text-xs italic text-slate-500 pl-0.5">
                  {signal.aiInsight}
                </p>
              )}

              {/* Source hint */}
              <p className="text-[10px] text-slate-400">{signal.sourceHint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
