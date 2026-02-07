"use client";

import Link from "next/link";
import { ArrowRight, Stethoscope, UserCircle } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<"physio" | "gp" | null>(null);

  return (
    <div className="organic-bg relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="animate-fade-in-up mb-6">
            <span className="inline-block rounded-full bg-[hsl(var(--kinetic-wine))]/10 px-4 py-1.5 text-sm font-medium text-[hsl(var(--kinetic-wine))]">
              Referral Routing Feature
            </span>
          </div>
          <h1 className="animate-fade-in-up animation-delay-200 mb-6 text-balance text-5xl font-semibold leading-[1.1] tracking-tight text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
            Connect care,{" "}
            <span className="italic text-[hsl(var(--kinetic-wine))]">
              effortlessly
            </span>
          </h1>
          <p className="animate-fade-in-up animation-delay-400 mx-auto max-w-2xl text-balance text-lg leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-xl">
            Quality-based physiotherapist referral routing that preserves
            autonomy while building trust through transparency
          </p>
        </div>

        {/* User Type Selector */}
        <div className="animate-fade-in-up animation-delay-600 mb-12">
          <h2 className="mb-8 text-center text-2xl font-semibold text-[hsl(var(--foreground))]">
            I am a...
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Physiotherapist Card */}
            <div
              onClick={() => setSelectedRole("physio")}
              className={`card-sculptural group relative cursor-pointer overflow-hidden rounded-3xl border-2 p-8 transition-all ${
                selectedRole === "physio"
                  ? "border-[hsl(var(--kinetic-wine))] bg-[hsl(var(--kinetic-wine))]/5"
                  : "border-transparent hover:border-[hsl(var(--kinetic-wine))]/30"
              }`}
            >
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--kinetic-wine))]/10 transition-transform group-hover:scale-110">
                    <UserCircle className="h-8 w-8 text-[hsl(var(--kinetic-wine))]" />
                  </div>
                  <div
                    className={`rounded-full p-2 transition-all ${
                      selectedRole === "physio"
                        ? "bg-[hsl(var(--kinetic-wine))] text-white"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--kinetic-wine))]/10"
                    }`}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mb-3 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Physiotherapist
                </h3>
                <p className="mb-6 leading-relaxed text-[hsl(var(--muted-foreground))]">
                  Build quality signals, gain eligibility, and receive GP
                  referrals through transparent data sharing
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Opt-in with preview mode
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      View quality signals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Manage patient consent
                    </span>
                  </div>
                </div>
              </div>

              {selectedRole === "physio" && (
                <div className="mt-8 space-y-2">
                  <p className="text-sm font-medium text-[hsl(var(--kinetic-wine))]">
                    Select a physiotherapist:
                  </p>
                  <div className="grid gap-2">
                    <Link
                      href="/physio/physio-sarah"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. Sarah Chen</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/physio/physio-james"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. James Park</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/physio/physio-maya"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. Maya Patel</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* GP Card */}
            <div
              onClick={() => setSelectedRole("gp")}
              className={`card-sculptural group relative cursor-pointer overflow-hidden rounded-3xl border-2 p-8 transition-all ${
                selectedRole === "gp"
                  ? "border-[hsl(var(--kinetic-wine))] bg-[hsl(var(--kinetic-wine))]/5"
                  : "border-transparent hover:border-[hsl(var(--kinetic-wine))]/30"
              }`}
            >
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--kinetic-wine))]/10 transition-transform group-hover:scale-110">
                    <Stethoscope className="h-8 w-8 text-[hsl(var(--kinetic-wine))]" />
                  </div>
                  <div
                    className={`rounded-full p-2 transition-all ${
                      selectedRole === "gp"
                        ? "bg-[hsl(var(--kinetic-wine))] text-white"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--kinetic-wine))]/10"
                    }`}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mb-3 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  General Practitioner
                </h3>
                <p className="mb-6 leading-relaxed text-[hsl(var(--muted-foreground))]">
                  Discover quality physiotherapists through referral sets with
                  confidence indicators, not rankings
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      View referral sets
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      See quality indicators
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--kinetic-wine))]" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Filter by specialty
                    </span>
                  </div>
                </div>
              </div>

              {selectedRole === "gp" && (
                <div className="mt-8 space-y-2">
                  <p className="text-sm font-medium text-[hsl(var(--kinetic-wine))]">
                    Select a GP:
                  </p>
                  <div className="grid gap-2">
                    <Link
                      href="/gp/gp-alice"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. Alice Thompson</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/gp/gp-robert"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. Robert Osei</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/gp/gp-emma"
                      className="btn-kinetic flex items-center justify-between rounded-xl px-4 py-3 text-white transition-all hover:px-5"
                    >
                      <span className="font-medium">Dr. Emma Wilson</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demo CTA */}
        <div className="animate-fade-in-up animation-delay-800 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--kinetic-wine))]/20 bg-white/80 px-6 py-3 font-medium text-[hsl(var(--kinetic-wine))] backdrop-blur-sm transition-all hover:border-[hsl(var(--kinetic-wine))]/40 hover:bg-white"
          >
            <span>View Guided Demo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
