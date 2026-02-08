"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  name: string;
  hasNotes: boolean;
}

interface GpSidebarProps {
  gpId: string;
  patients: Patient[];
}

const navItems = [
  {
    label: "Dashboard",
    href: (id: string) => `/gp/${id}`,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Referrals",
    href: (id: string) => `/gp/${id}/referral`,
    icon: Send,
  },
];

export function GpSidebar({ gpId, patients }: GpSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) => {
    const href = item.href(gpId);
    if (item.exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[hsl(var(--kinetic-sage)/0.15)] bg-[hsl(160_20%_98%)] md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-sage))]">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="font-semibold text-[hsl(var(--kinetic-sage))]">
              Kinetic
            </span>
          </Link>
          <Link href={`/gp/${gpId}/referral/new`}>
            <Button size="sm" className="btn-gp text-white">
              <Plus className="mr-1.5 h-4 w-4" />
              New Referral
            </Button>
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[hsl(var(--kinetic-sage)/0.1)] px-4 py-2">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={`mobile-${item.label}`}
                href={item.href(gpId)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium",
                  active
                    ? "border-[hsl(var(--kinetic-sage))] bg-[hsl(var(--kinetic-sage)/0.12)] text-[hsl(var(--kinetic-sage))]"
                    : "border-[hsl(var(--kinetic-sage)/0.2)] bg-white text-slate-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[hsl(var(--kinetic-sage)/0.15)] bg-[hsl(160_20%_98%)] md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-[hsl(var(--kinetic-sage)/0.15)] px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-sage))]">
                <span className="text-sm font-bold text-white">K</span>
              </div>
              <span className="font-semibold text-[hsl(var(--kinetic-sage))]">
                Kinetic
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href(gpId)}
                  className={cn(
                    "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "active bg-[hsl(var(--kinetic-sage)/0.1)] text-[hsl(var(--kinetic-sage))] border-l-[3px] border-[hsl(var(--kinetic-sage))] -ml-[3px]"
                      : "text-slate-600 hover:bg-[hsl(var(--kinetic-sage)/0.05)] hover:text-[hsl(var(--kinetic-sage))]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* New Referral CTA */}
          <div className="px-3 py-2">
            <Link href={`/gp/${gpId}/referral/new`}>
              <Button className="btn-gp w-full text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Referral
              </Button>
            </Link>
          </div>

          {/* Patient List */}
          <div className="flex-1 overflow-hidden border-t border-[hsl(var(--kinetic-sage)/0.15)] px-3 py-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent Patients
            </p>
            <div className="max-h-[calc(100vh-320px)] space-y-1 overflow-y-auto">
              {patients.slice(0, 8).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {patient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="truncate">{patient.name}</span>
                  {patient.hasNotes && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--kinetic-sage))]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[hsl(var(--kinetic-sage)/0.15)] p-4">
            <p className="text-xs text-slate-500">
              Quality-based referral routing
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
