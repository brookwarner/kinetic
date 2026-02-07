"use client";

import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface PatientCardProps {
  id: string;
  name: string;
  dateOfBirth: string;
  region: string;
  hasNotes: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function PatientCard({
  id,
  name,
  dateOfBirth,
  region,
  hasNotes,
  isSelected,
  onClick,
}: PatientCardProps) {
  // Calculate age from date of birth
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-all",
        isSelected
          ? "border-[hsl(var(--kinetic-sage))] bg-[hsl(var(--kinetic-sage)/0.05)] ring-2 ring-[hsl(var(--kinetic-sage)/0.2)]"
          : "border-slate-200 bg-white hover:border-[hsl(var(--kinetic-sage)/0.3)] hover:bg-slate-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
            isSelected
              ? "bg-[hsl(var(--kinetic-sage))] text-white"
              : "bg-slate-100 text-slate-600"
          )}>
            {name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className={cn(
              "font-medium",
              isSelected ? "text-[hsl(var(--kinetic-sage-dark))]" : "text-slate-900"
            )}>
              {name}
            </p>
            <p className="text-sm text-slate-500">
              Age {age} • {region}
            </p>
          </div>
        </div>
        {hasNotes && (
          <div className="flex items-center gap-1 text-[hsl(var(--kinetic-sage))]">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Notes</span>
          </div>
        )}
      </div>
    </button>
  );
}
