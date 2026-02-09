// Hardcoded benchmark data for demo purposes.
// Simulates AI-analyzed benchmark comparisons without real computation.

export interface BenchmarkSignal {
  id: string;
  label: string;
  description: string;
  yourValue: string;
  benchmark: string;
  percentile: number; // 0-100
  status: "above" | "at" | "below";
  aiInsight?: string;
  sourceHint: string;
}

export interface BenchmarkCategory {
  id: string;
  name: string;
  iconName: string;
  summary: string;
  signals: BenchmarkSignal[];
}

export interface PhysioBenchmarkData {
  physioId: string;
  lastAnalyzed: string;
  episodesAnalyzed: number;
  overallPercentile: number;
  categories: BenchmarkCategory[];
}

// Helper to compute category-level summary
function categorySummary(signals: BenchmarkSignal[]): string {
  const above = signals.filter((s) => s.status === "above").length;
  const at = signals.filter((s) => s.status === "at").length;
  const below = signals.filter((s) => s.status === "below").length;
  const parts: string[] = [];
  if (above > 0) parts.push(`${above} above`);
  if (at > 0) parts.push(`${at} at median`);
  if (below > 0) parts.push(`${below} below`);
  return parts.join(", ");
}

// ─── Signal templates (reused across personas with different values) ─────────

function clinicalOutcomes(
  recovery: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  timeToOutcome: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  reinjury: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "recovery-rate",
      label: "Risk-adjusted recovery rate",
      description: "Recovery rate adjusted for patient complexity and condition severity",
      yourValue: recovery.value,
      benchmark: recovery.bench,
      percentile: recovery.pct,
      status: recovery.status,
      aiInsight: recovery.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "time-to-outcome",
      label: "Time to successful outcome",
      description: "Median days to successful discharge vs industry benchmark",
      yourValue: timeToOutcome.value,
      benchmark: timeToOutcome.bench,
      percentile: timeToOutcome.pct,
      status: timeToOutcome.status,
      aiInsight: timeToOutcome.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "reinjury-rate",
      label: "Re-injury within 90 days",
      description: "Percentage of patients experiencing recurrence within 90 days of discharge",
      yourValue: reinjury.value,
      benchmark: reinjury.bench,
      percentile: reinjury.pct,
      status: reinjury.status,
      aiInsight: reinjury.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "clinical-outcomes",
    name: "Clinical Outcomes",
    iconName: "Activity",
    summary: categorySummary(signals),
    signals,
  };
}

function evidenceAndTechnique(
  evidenceAligned: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  techniqueBreadth: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  visitPattern: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "evidence-aligned",
      label: "Evidence-aligned interventions",
      description: "Percentage of interventions aligned with latest clinical guidelines and protocols",
      yourValue: evidenceAligned.value,
      benchmark: evidenceAligned.bench,
      percentile: evidenceAligned.pct,
      status: evidenceAligned.status,
      aiInsight: evidenceAligned.insight,
      sourceHint: `Based on ${episodes} consented episodes · Protocols updated Jan 2026`,
    },
    {
      id: "technique-breadth",
      label: "Technique breadth score",
      description: "Distribution of treatment modalities across conditions",
      yourValue: techniqueBreadth.value,
      benchmark: techniqueBreadth.bench,
      percentile: techniqueBreadth.pct,
      status: techniqueBreadth.status,
      aiInsight: techniqueBreadth.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "visit-frequency-pattern",
      label: "Visit frequency pattern",
      description: "Match between actual visit cadence and expected tapering curve (weekly → fortnightly → monthly → discharge)",
      yourValue: visitPattern.value,
      benchmark: visitPattern.bench,
      percentile: visitPattern.pct,
      status: visitPattern.status,
      aiInsight: visitPattern.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "evidence-technique",
    name: "Evidence & Technique",
    iconName: "BookOpen",
    summary: categorySummary(signals),
    signals,
  };
}

function patientJourney(
  selfDischarge: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  noShow: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  timeToFirst: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  changingPhysio: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "self-discharge-unresolved",
      label: "Self-discharge unresolved",
      description: "Percentage of self-discharged patients with unresolved clinical flags in notes",
      yourValue: selfDischarge.value,
      benchmark: selfDischarge.bench,
      percentile: selfDischarge.pct,
      status: selfDischarge.status,
      aiInsight: selfDischarge.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "no-show-cancellation",
      label: "No-show and cancellation rate",
      description: "Percentage of scheduled appointments resulting in no-show or late cancellation",
      yourValue: noShow.value,
      benchmark: noShow.bench,
      percentile: noShow.pct,
      status: noShow.status,
      aiInsight: noShow.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "time-to-first",
      label: "Time to first appointment",
      description: "Median days from referral to first appointment",
      yourValue: timeToFirst.value,
      benchmark: timeToFirst.bench,
      percentile: timeToFirst.pct,
      status: timeToFirst.status,
      aiInsight: timeToFirst.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "changing-physio",
      label: "Changing physio within practice",
      description: "Internal transfer rate with reason categorisation",
      yourValue: changingPhysio.value,
      benchmark: changingPhysio.bench,
      percentile: changingPhysio.pct,
      status: changingPhysio.status,
      aiInsight: changingPhysio.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "patient-journey",
    name: "Patient Journey",
    iconName: "Route",
    summary: categorySummary(signals),
    signals,
  };
}

function patientEngagement(
  morale: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  homeExercise: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  promCompletion: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  goalAttainment: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "patient-morale",
      label: "Patient morale (PROMs)",
      description: "Mood and confidence trend from patient-reported outcome measures and note sentiment",
      yourValue: morale.value,
      benchmark: morale.bench,
      percentile: morale.pct,
      status: morale.status,
      aiInsight: morale.insight,
      sourceHint: `Based on ${episodes} consented episodes · Sentiment analysis from notes`,
    },
    {
      id: "home-exercise-adherence",
      label: "Home exercise adherence",
      description: "Percentage of patients reporting consistent home program completion",
      yourValue: homeExercise.value,
      benchmark: homeExercise.bench,
      percentile: homeExercise.pct,
      status: homeExercise.status,
      aiInsight: homeExercise.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "prom-completion",
      label: "PROM completion rate",
      description: "Percentage of scheduled patient-reported outcome measures actually completed",
      yourValue: promCompletion.value,
      benchmark: promCompletion.bench,
      percentile: promCompletion.pct,
      status: promCompletion.status,
      aiInsight: promCompletion.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "goal-attainment",
      label: "Goal attainment scaling",
      description: "Completion rate of personalised treatment goals using GAS methodology",
      yourValue: goalAttainment.value,
      benchmark: goalAttainment.bench,
      percentile: goalAttainment.pct,
      status: goalAttainment.status,
      aiInsight: goalAttainment.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "patient-engagement",
    name: "Patient Engagement",
    iconName: "Heart",
    summary: categorySummary(signals),
    signals,
  };
}

function practiceNetwork(
  inboundTransfers: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  specialistEngagement: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  specialistReferrals: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "inbound-transfers",
      label: "Patients arriving from other practices",
      description: "Inbound transfer percentage and post-transfer outcome success rate",
      yourValue: inboundTransfers.value,
      benchmark: inboundTransfers.bench,
      percentile: inboundTransfers.pct,
      status: inboundTransfers.status,
      aiInsight: inboundTransfers.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "specialist-engagement",
      label: "Specialist engagement frequency",
      description: "Specialist consultation rate scaled by condition complexity",
      yourValue: specialistEngagement.value,
      benchmark: specialistEngagement.bench,
      percentile: specialistEngagement.pct,
      status: specialistEngagement.status,
      aiInsight: specialistEngagement.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "specialist-referrals",
      label: "Specialist referrals to clinic",
      description: "Referral volume from specialists and conversion to successful outcome",
      yourValue: specialistReferrals.value,
      benchmark: specialistReferrals.bench,
      percentile: specialistReferrals.pct,
      status: specialistReferrals.status,
      aiInsight: specialistReferrals.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "practice-network",
    name: "Practice Network",
    iconName: "Network",
    summary: categorySummary(signals),
    signals,
  };
}

function safetyAndEquity(
  adverseEvent: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  equity: { value: string; bench: string; pct: number; status: "above" | "at" | "below"; insight?: string },
  episodes: number,
): BenchmarkCategory {
  const signals: BenchmarkSignal[] = [
    {
      id: "adverse-event-rate",
      label: "Adverse event rate",
      description: "Reported adverse events per 100 episodes, risk-adjusted",
      yourValue: adverseEvent.value,
      benchmark: adverseEvent.bench,
      percentile: adverseEvent.pct,
      status: adverseEvent.status,
      aiInsight: adverseEvent.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
    {
      id: "equity-index",
      label: "Demographic equity index",
      description: "Outcome consistency across age, sex, and socioeconomic groups (no unfair gaps)",
      yourValue: equity.value,
      benchmark: equity.bench,
      percentile: equity.pct,
      status: equity.status,
      aiInsight: equity.insight,
      sourceHint: `Based on ${episodes} consented episodes`,
    },
  ];
  return {
    id: "safety-equity",
    name: "Safety & Equity",
    iconName: "ShieldCheck",
    summary: categorySummary(signals),
    signals,
  };
}

// ─── Per-persona benchmark data ──────────────────────────────────────────────

const sarahData: PhysioBenchmarkData = {
  physioId: "physio-sarah",
  lastAnalyzed: "2 days ago",
  episodesAnalyzed: 15,
  overallPercentile: 82,
  categories: [
    clinicalOutcomes(
      { value: "84%", bench: "Industry median: 71%", pct: 91, status: "above", insight: "Your knee and post-surgical recovery rates are particularly strong, exceeding regional benchmarks by 13 percentage points" },
      { value: "32 days", bench: "Industry median: 41 days", pct: 85, status: "above", insight: "Patients reach functional goals faster than peers, especially for sports-related conditions" },
      { value: "4%", bench: "Industry median: 8%", pct: 88, status: "above", insight: "Re-injury rate is well below benchmark — strong discharge timing" },
      15,
    ),
    evidenceAndTechnique(
      { value: "91%", bench: "Industry median: 78%", pct: 89, status: "above", insight: "High alignment with 2025 MSK clinical guidelines — early adopter of updated protocols" },
      { value: "7.2", bench: "Industry median: 5.4", pct: 82, status: "above", insight: "Broad modality use across conditions — manual therapy, exercise, dry needling, hydrotherapy" },
      { value: "87% match", bench: "Industry median: 72%", pct: 78, status: "above", insight: "Visit cadence closely follows evidence-based tapering curve" },
      15,
    ),
    patientJourney(
      { value: "5%", bench: "Industry median: 12%", pct: 86, status: "above", insight: "Very low unresolved self-discharge — patients rarely leave with outstanding clinical concerns" },
      { value: "6%", bench: "Industry median: 11%", pct: 80, status: "above" },
      { value: "2.1 days", bench: "Industry median: 3.8 days", pct: 84, status: "above", insight: "Patients are seen quickly after referral — strong intake efficiency" },
      { value: "3%", bench: "Industry median: 7%", pct: 75, status: "above" },
      15,
    ),
    patientEngagement(
      { value: "+18 pts", bench: "Industry median: +9 pts", pct: 88, status: "above", insight: "Patient confidence scores improve substantially through treatment, with positive sentiment in 89% of notes" },
      { value: "74%", bench: "Industry median: 62%", pct: 76, status: "above" },
      { value: "88%", bench: "Industry median: 71%", pct: 81, status: "above", insight: "Consistent PROM data collection enables richer signal computation" },
      { value: "79%", bench: "Industry median: 65%", pct: 77, status: "above" },
      15,
    ),
    practiceNetwork(
      { value: "22%", bench: "Industry median: 14%", pct: 79, status: "above", insight: "Higher-than-average inbound transfers suggest strong reputation among peers" },
      { value: "0.31", bench: "Industry median: 0.22", pct: 74, status: "above" },
      { value: "8 per quarter", bench: "Industry median: 4", pct: 83, status: "above", insight: "Strong specialist referral pipeline indicates trusted clinical relationships" },
      15,
    ),
    safetyAndEquity(
      { value: "0.8 per 100", bench: "Industry median: 1.4 per 100", pct: 79, status: "above" },
      { value: "0.94", bench: "Industry median: 0.85", pct: 82, status: "above", insight: "Outcomes are consistent across demographics — no significant gaps detected" },
      15,
    ),
  ],
};

const jamesData: PhysioBenchmarkData = {
  physioId: "physio-james",
  lastAnalyzed: "4 days ago",
  episodesAnalyzed: 12,
  overallPercentile: 71,
  categories: [
    clinicalOutcomes(
      { value: "78%", bench: "Industry median: 71%", pct: 74, status: "above", insight: "Solid recovery rates, particularly strong for chronic pain management" },
      { value: "38 days", bench: "Industry median: 41 days", pct: 68, status: "above" },
      { value: "7%", bench: "Industry median: 8%", pct: 62, status: "above" },
      12,
    ),
    evidenceAndTechnique(
      { value: "82%", bench: "Industry median: 78%", pct: 66, status: "above" },
      { value: "5.8", bench: "Industry median: 5.4", pct: 61, status: "above" },
      { value: "75% match", bench: "Industry median: 72%", pct: 58, status: "at" },
      12,
    ),
    patientJourney(
      { value: "10%", bench: "Industry median: 12%", pct: 63, status: "above" },
      { value: "9%", bench: "Industry median: 11%", pct: 60, status: "at" },
      { value: "3.5 days", bench: "Industry median: 3.8 days", pct: 58, status: "at", insight: "Intake timing is close to benchmark — room for small improvements" },
      { value: "6%", bench: "Industry median: 7%", pct: 56, status: "at" },
      12,
    ),
    patientEngagement(
      { value: "+12 pts", bench: "Industry median: +9 pts", pct: 72, status: "above", insight: "Patients report meaningful improvement in confidence during treatment" },
      { value: "65%", bench: "Industry median: 62%", pct: 58, status: "at" },
      { value: "76%", bench: "Industry median: 71%", pct: 63, status: "above" },
      { value: "68%", bench: "Industry median: 65%", pct: 60, status: "at" },
      12,
    ),
    practiceNetwork(
      { value: "16%", bench: "Industry median: 14%", pct: 62, status: "above" },
      { value: "0.24", bench: "Industry median: 0.22", pct: 57, status: "at" },
      { value: "5 per quarter", bench: "Industry median: 4", pct: 65, status: "above" },
      12,
    ),
    safetyAndEquity(
      { value: "1.2 per 100", bench: "Industry median: 1.4 per 100", pct: 62, status: "above" },
      { value: "0.87", bench: "Industry median: 0.85", pct: 55, status: "at" },
      12,
    ),
  ],
};

const mayaData: PhysioBenchmarkData = {
  physioId: "physio-maya",
  lastAnalyzed: "3 days ago",
  episodesAnalyzed: 8,
  overallPercentile: 58,
  categories: [
    clinicalOutcomes(
      { value: "73%", bench: "Industry median: 71%", pct: 58, status: "above" },
      { value: "40 days", bench: "Industry median: 41 days", pct: 53, status: "at", insight: "Time to outcome is close to benchmark — building data will refine this signal" },
      { value: "9%", bench: "Industry median: 8%", pct: 44, status: "below", insight: "Slightly above median re-injury rate — small sample size may be a factor" },
      8,
    ),
    evidenceAndTechnique(
      { value: "85%", bench: "Industry median: 78%", pct: 74, status: "above", insight: "Strong evidence alignment — early adopter of updated rehabilitation protocols" },
      { value: "6.1", bench: "Industry median: 5.4", pct: 68, status: "above", insight: "Good range of modalities including emerging techniques like blood flow restriction training" },
      { value: "70% match", bench: "Industry median: 72%", pct: 47, status: "below" },
      8,
    ),
    patientJourney(
      { value: "11%", bench: "Industry median: 12%", pct: 54, status: "at" },
      { value: "10%", bench: "Industry median: 11%", pct: 52, status: "at" },
      { value: "3.2 days", bench: "Industry median: 3.8 days", pct: 66, status: "above" },
      { value: "8%", bench: "Industry median: 7%", pct: 44, status: "below" },
      8,
    ),
    patientEngagement(
      { value: "+10 pts", bench: "Industry median: +9 pts", pct: 57, status: "at" },
      { value: "68%", bench: "Industry median: 62%", pct: 65, status: "above" },
      { value: "72%", bench: "Industry median: 71%", pct: 53, status: "at" },
      { value: "64%", bench: "Industry median: 65%", pct: 49, status: "at" },
      8,
    ),
    practiceNetwork(
      { value: "12%", bench: "Industry median: 14%", pct: 44, status: "at" },
      { value: "0.20", bench: "Industry median: 0.22", pct: 46, status: "at" },
      { value: "3 per quarter", bench: "Industry median: 4", pct: 42, status: "at" },
      8,
    ),
    safetyAndEquity(
      { value: "1.5 per 100", bench: "Industry median: 1.4 per 100", pct: 47, status: "at" },
      { value: "0.88", bench: "Industry median: 0.85", pct: 59, status: "above" },
      8,
    ),
  ],
};

const tomData: PhysioBenchmarkData = {
  physioId: "physio-tom",
  lastAnalyzed: "1 day ago",
  episodesAnalyzed: 14,
  overallPercentile: 47,
  categories: [
    clinicalOutcomes(
      { value: "68%", bench: "Industry median: 71%", pct: 42, status: "below", insight: "Recovery rate is slightly below median — your neurological cases show strong outcomes but MSK cases may benefit from protocol review" },
      { value: "46 days", bench: "Industry median: 41 days", pct: 38, status: "below", insight: "Longer-than-average treatment duration — consider whether earlier discharge criteria could apply" },
      { value: "6%", bench: "Industry median: 8%", pct: 72, status: "above", insight: "Good re-injury prevention despite longer treatment times" },
      14,
    ),
    evidenceAndTechnique(
      { value: "74%", bench: "Industry median: 78%", pct: 41, status: "below" },
      { value: "4.8", bench: "Industry median: 5.4", pct: 38, status: "below", insight: "Narrower modality range — you may benefit from exploring additional treatment approaches for complex cases" },
      { value: "64% match", bench: "Industry median: 72%", pct: 35, status: "below", insight: "Visit spacing is more uniform than expected tapering pattern" },
      14,
    ),
    patientJourney(
      { value: "15%", bench: "Industry median: 12%", pct: 37, status: "below", insight: "Higher self-discharge with unresolved flags — review patient communication around discharge planning" },
      { value: "13%", bench: "Industry median: 11%", pct: 42, status: "below" },
      { value: "4.1 days", bench: "Industry median: 3.8 days", pct: 46, status: "at" },
      { value: "5%", bench: "Industry median: 7%", pct: 64, status: "above" },
      14,
    ),
    patientEngagement(
      { value: "+7 pts", bench: "Industry median: +9 pts", pct: 40, status: "below" },
      { value: "56%", bench: "Industry median: 62%", pct: 38, status: "below", insight: "Below-average home exercise completion — consider simpler programs or digital tracking" },
      { value: "82%", bench: "Industry median: 71%", pct: 74, status: "above", insight: "Strong PROM completion suggests good patient rapport despite engagement challenges" },
      { value: "61%", bench: "Industry median: 65%", pct: 45, status: "at" },
      14,
    ),
    practiceNetwork(
      { value: "19%", bench: "Industry median: 14%", pct: 72, status: "above", insight: "Strong inbound transfer rate — patients seek you out for neurological conditions" },
      { value: "0.28", bench: "Industry median: 0.22", pct: 70, status: "above" },
      { value: "3 per quarter", bench: "Industry median: 4", pct: 42, status: "at" },
      14,
    ),
    safetyAndEquity(
      { value: "1.6 per 100", bench: "Industry median: 1.4 per 100", pct: 44, status: "at" },
      { value: "0.82", bench: "Industry median: 0.85", pct: 42, status: "at" },
      14,
    ),
  ],
};

const aishaData: PhysioBenchmarkData = {
  physioId: "physio-aisha",
  lastAnalyzed: "5 days ago",
  episodesAnalyzed: 10,
  overallPercentile: 62,
  categories: [
    clinicalOutcomes(
      { value: "75%", bench: "Industry median: 71%", pct: 66, status: "above" },
      { value: "39 days", bench: "Industry median: 41 days", pct: 62, status: "above" },
      { value: "7%", bench: "Industry median: 8%", pct: 60, status: "above" },
      10,
    ),
    evidenceAndTechnique(
      { value: "80%", bench: "Industry median: 78%", pct: 59, status: "at", insight: "Solid evidence alignment with room to adopt newer pelvic floor rehabilitation protocols" },
      { value: "5.6", bench: "Industry median: 5.4", pct: 56, status: "at" },
      { value: "74% match", bench: "Industry median: 72%", pct: 55, status: "at" },
      10,
    ),
    patientJourney(
      { value: "9%", bench: "Industry median: 12%", pct: 68, status: "above", insight: "Low unresolved self-discharge — strong patient communication around treatment completion" },
      { value: "10%", bench: "Industry median: 11%", pct: 54, status: "at" },
      { value: "3.6 days", bench: "Industry median: 3.8 days", pct: 57, status: "at" },
      { value: "6%", bench: "Industry median: 7%", pct: 58, status: "at" },
      10,
    ),
    patientEngagement(
      { value: "+11 pts", bench: "Industry median: +9 pts", pct: 66, status: "above", insight: "Patients in women's health programs report particularly strong confidence improvements" },
      { value: "70%", bench: "Industry median: 62%", pct: 71, status: "above" },
      { value: "74%", bench: "Industry median: 71%", pct: 57, status: "at" },
      { value: "72%", bench: "Industry median: 65%", pct: 67, status: "above" },
      10,
    ),
    practiceNetwork(
      { value: "15%", bench: "Industry median: 14%", pct: 55, status: "at" },
      { value: "0.25", bench: "Industry median: 0.22", pct: 61, status: "above" },
      { value: "4 per quarter", bench: "Industry median: 4", pct: 52, status: "at" },
      10,
    ),
    safetyAndEquity(
      { value: "1.1 per 100", bench: "Industry median: 1.4 per 100", pct: 70, status: "above" },
      { value: "0.91", bench: "Industry median: 0.85", pct: 74, status: "above", insight: "Strong equity outcomes — consistent results across all demographic groups" },
      10,
    ),
  ],
};

const allBenchmarkData: Record<string, PhysioBenchmarkData> = {
  "physio-sarah": sarahData,
  "physio-james": jamesData,
  "physio-maya": mayaData,
  "physio-tom": tomData,
  "physio-aisha": aishaData,
};

export function getBenchmarkSignals(physioId: string): PhysioBenchmarkData | null {
  return allBenchmarkData[physioId] ?? null;
}

// Helper: get the top signal (highest percentile) for a physio
export function getTopBenchmarkSignal(physioId: string): { label: string; percentile: number } | null {
  const data = getBenchmarkSignals(physioId);
  if (!data) return null;

  let top: { label: string; percentile: number } | null = null;
  for (const category of data.categories) {
    for (const signal of category.signals) {
      if (!top || signal.percentile > top.percentile) {
        top = { label: signal.label, percentile: signal.percentile };
      }
    }
  }
  return top;
}

// Helper: map signal type to benchmark category for percentile summary
export function getBenchmarkForSignalType(
  physioId: string,
  signalType: "outcome-trajectory" | "clinical-decision" | "patient-preference",
): { percentile: number; status: "above" | "at" | "below" } | null {
  const data = getBenchmarkSignals(physioId);
  if (!data) return null;

  const categoryMap: Record<string, string> = {
    "outcome-trajectory": "clinical-outcomes",
    "clinical-decision": "evidence-technique",
    "patient-preference": "patient-engagement",
  };

  const categoryId = categoryMap[signalType];
  const category = data.categories.find((c) => c.id === categoryId);
  if (!category) return null;

  const avgPercentile = Math.round(
    category.signals.reduce((sum, s) => sum + s.percentile, 0) / category.signals.length,
  );

  const status: "above" | "at" | "below" =
    avgPercentile >= 60 ? "above" : avgPercentile >= 45 ? "at" : "below";

  return { percentile: avgPercentile, status };
}
