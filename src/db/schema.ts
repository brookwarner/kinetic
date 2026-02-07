import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const physiotherapists = sqliteTable("physiotherapists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  clinicName: text("clinic_name").notNull(),
  region: text("region").notNull(),
  specialties: text("specialties", { mode: "json" }).$type<string[]>().notNull(),
  capacity: text("capacity", {
    enum: ["available", "limited", "waitlist"],
  }).notNull().default("available"),
  optedIn: integer("opted_in", { mode: "boolean" }).notNull().default(false),
  optedInAt: integer("opted_in_at", { mode: "timestamp" }),
  optedOutAt: integer("opted_out_at", { mode: "timestamp" }),
  previewMode: integer("preview_mode", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  region: text("region").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const gps = sqliteTable("gps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  practiceName: text("practice_name").notNull(),
  region: text("region").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const episodes = sqliteTable("episodes", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  physioId: text("physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  referringGpId: text("referring_gp_id").references(() => gps.id),
  condition: text("condition").notNull(),
  status: text("status", {
    enum: ["active", "discharged", "self-discharged", "transferred"],
  }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  dischargedAt: integer("discharged_at", { mode: "timestamp" }),
  isGpReferred: integer("is_gp_referred", { mode: "boolean" })
    .notNull()
    .default(false),
  priorPhysioEpisodeId: text("prior_physio_episode_id").references(
    (): any => episodes.id
  ),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  episodeId: text("episode_id")
    .notNull()
    .references(() => episodes.id),
  visitDate: integer("visit_date", { mode: "timestamp" }).notNull(),
  visitNumber: integer("visit_number").notNull(),
  notesSummary: text("notes_summary"),
  escalated: integer("escalated", { mode: "boolean" }).notNull().default(false),
  treatmentAdjusted: integer("treatment_adjusted", { mode: "boolean" })
    .notNull()
    .default(false),
  painScore: integer("pain_score"),
  functionScore: integer("function_score"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const consents = sqliteTable("consents", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  episodeId: text("episode_id")
    .notNull()
    .references(() => episodes.id),
  physioId: text("physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  status: text("status", { enum: ["granted", "revoked"] }).notNull(),
  grantedAt: integer("granted_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  scope: text("scope").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const computedSignals = sqliteTable("computed_signals", {
  id: text("id").primaryKey(),
  physioId: text("physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  signalType: text("signal_type", {
    enum: ["outcome-trajectory", "clinical-decision", "patient-preference"],
  }).notNull(),
  value: integer("value").notNull(), // 0-1 stored as integer (0-100)
  confidence: text("confidence", { enum: ["low", "medium", "high"] }).notNull(),
  episodeCount: integer("episode_count").notNull(),
  computedAt: integer("computed_at", { mode: "timestamp" }).notNull(),
  details: text("details", { mode: "json" }).$type<Record<string, any>>(),
});

export const simulatedEligibility = sqliteTable("simulated_eligibility", {
  id: text("id").primaryKey(),
  physioId: text("physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  region: text("region").notNull(),
  eligibleReferralSets: integer("eligible_referral_sets").notNull(),
  totalReferralSets: integer("total_referral_sets").notNull(),
  confidenceFactors: text("confidence_factors", { mode: "json" }).$type<
    Record<string, any>
  >(),
  gaps: text("gaps", { mode: "json" }).$type<string[]>(),
  simulatedAt: integer("simulated_at", { mode: "timestamp" }).notNull(),
});

export const gpPatientNotes = sqliteTable("gp_patient_notes", {
  id: text("id").primaryKey(),
  gpId: text("gp_id")
    .notNull()
    .references(() => gps.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  notes: text("notes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Transition Events — records every care transition moment
export const transitionEvents = sqliteTable("transition_events", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  originEpisodeId: text("origin_episode_id")
    .notNull()
    .references(() => episodes.id),
  originPhysioId: text("origin_physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  destinationEpisodeId: text("destination_episode_id").references(
    () => episodes.id
  ),
  destinationPhysioId: text("destination_physio_id").references(
    () => physiotherapists.id
  ),
  referringGpId: text("referring_gp_id").references(() => gps.id),
  transitionType: text("transition_type", {
    enum: ["gp-referral", "patient-booking", "physio-handoff"],
  }).notNull(),
  status: text("status", {
    enum: [
      "initiated",
      "consent-pending",
      "summary-pending",
      "review-pending",
      "released",
      "declined",
      "expired",
    ],
  }).notNull(),
  initiatedAt: integer("initiated_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Continuity Consents — separate from existing consents (different scope and domain)
export const continuityConsents = sqliteTable("continuity_consents", {
  id: text("id").primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  transitionEventId: text("transition_event_id")
    .notNull()
    .references(() => transitionEvents.id),
  originEpisodeId: text("origin_episode_id")
    .notNull()
    .references(() => episodes.id),
  status: text("status", {
    enum: ["granted", "revoked", "expired"],
  }).notNull(),
  scope: text("scope").notNull().default("continuity-summary-for-transition"),
  grantedAt: integer("granted_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Continuity Summaries — stores generated structured summaries
export const continuitySummaries = sqliteTable("continuity_summaries", {
  id: text("id").primaryKey(),
  transitionEventId: text("transition_event_id")
    .notNull()
    .references(() => transitionEvents.id),
  originEpisodeId: text("origin_episode_id")
    .notNull()
    .references(() => episodes.id),
  originPhysioId: text("origin_physio_id")
    .notNull()
    .references(() => physiotherapists.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  // Structured content fields
  conditionFraming: text("condition_framing").notNull(),
  diagnosisHypothesis: text("diagnosis_hypothesis").notNull(),
  interventionsAttempted: text("interventions_attempted", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  responseProfile: text("response_profile", { mode: "json" })
    .$type<{ responded: string[]; didNotRespond: string[] }>()
    .notNull(),
  currentStatus: text("current_status").notNull(),
  openConsiderations: text("open_considerations", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  // Annotations and status
  physioAnnotations: text("physio_annotations"),
  status: text("summary_status", {
    enum: ["draft", "pending-review", "approved", "released", "revoked"],
  }).notNull(),
  generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  releasedAt: integer("released_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Type exports
export type Physiotherapist = typeof physiotherapists.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type GP = typeof gps.$inferSelect;
export type Episode = typeof episodes.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Consent = typeof consents.$inferSelect;
export type ComputedSignal = typeof computedSignals.$inferSelect;
export type SimulatedEligibility = typeof simulatedEligibility.$inferSelect;
export type GpPatientNote = typeof gpPatientNotes.$inferSelect;
export type TransitionEvent = typeof transitionEvents.$inferSelect;
export type ContinuityConsent = typeof continuityConsents.$inferSelect;
export type ContinuitySummary = typeof continuitySummaries.$inferSelect;
