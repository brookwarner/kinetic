"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  Send,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhysioSidebarProps {
  physioId: string;
}

const navItems = [
  {
    label: "Dashboard",
    href: (id: string) => `/physio/${id}`,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Patients",
    href: (id: string) => `/physio/${id}/episodes`,
    icon: Users,
  },
  {
    label: "Signals",
    href: (id: string) => `/physio/${id}/signals`,
    icon: Activity,
  },
  {
    label: "Referrals",
    href: (id: string) => `/physio/${id}/eligibility`,
    icon: Send,
  },
  {
    label: "Settings",
    href: (id: string) => `/physio/${id}/opt-in`,
    icon: Settings,
  },
];

export function PhysioSidebar({ physioId }: PhysioSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) => {
    const href = item.href(physioId);
    if (item.exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[hsl(var(--kinetic-wine)/0.1)] bg-[hsl(355_35%_98%)]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[hsl(var(--kinetic-wine)/0.1)] px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--kinetic-wine))]">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="font-semibold text-[hsl(var(--kinetic-wine))]">
              Kinetic
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href(physioId)}
                className={cn(
                  "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "active bg-[hsl(var(--kinetic-wine)/0.1)] text-[hsl(var(--kinetic-wine))] border-l-[3px] border-[hsl(var(--kinetic-wine))] -ml-[3px]"
                    : "text-slate-600 hover:bg-[hsl(var(--kinetic-wine)/0.05)] hover:text-[hsl(var(--kinetic-wine))]"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--kinetic-wine)/0.1)] p-4">
          <p className="text-xs text-slate-500">
            Quality-based referral routing
          </p>
        </div>
      </div>
    </aside>
  );
}
