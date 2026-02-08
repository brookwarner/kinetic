CREATE TABLE `computed_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`physio_id` text NOT NULL,
	`signal_type` text NOT NULL,
	`value` integer NOT NULL,
	`confidence` text NOT NULL,
	`episode_count` integer NOT NULL,
	`computed_at` integer NOT NULL,
	`details` text,
	FOREIGN KEY (`physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`episode_id` text NOT NULL,
	`physio_id` text NOT NULL,
	`status` text NOT NULL,
	`granted_at` integer,
	`revoked_at` integer,
	`scope` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `continuity_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`transition_event_id` text NOT NULL,
	`origin_episode_id` text NOT NULL,
	`status` text NOT NULL,
	`scope` text DEFAULT 'continuity-summary-for-transition' NOT NULL,
	`granted_at` integer,
	`revoked_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transition_event_id`) REFERENCES `transition_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `continuity_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`transition_event_id` text NOT NULL,
	`origin_episode_id` text NOT NULL,
	`origin_physio_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`condition_framing` text NOT NULL,
	`diagnosis_hypothesis` text NOT NULL,
	`interventions_attempted` text NOT NULL,
	`response_profile` text NOT NULL,
	`current_status` text NOT NULL,
	`open_considerations` text NOT NULL,
	`physio_annotations` text,
	`summary_status` text NOT NULL,
	`generated_at` integer NOT NULL,
	`reviewed_at` integer,
	`released_at` integer,
	`revoked_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`transition_event_id`) REFERENCES `transition_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`physio_id` text NOT NULL,
	`referring_gp_id` text,
	`condition` text NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`discharged_at` integer,
	`is_gp_referred` integer DEFAULT false NOT NULL,
	`prior_physio_episode_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referring_gp_id`) REFERENCES `gps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prior_physio_episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gp_patient_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`gp_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`notes` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`gp_id`) REFERENCES `gps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`practice_name` text NOT NULL,
	`region` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`region` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `physiotherapists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`clinic_name` text NOT NULL,
	`region` text NOT NULL,
	`specialties` text NOT NULL,
	`capacity` text DEFAULT 'available' NOT NULL,
	`opted_in` integer DEFAULT false NOT NULL,
	`opted_in_at` integer,
	`opted_out_at` integer,
	`preview_mode` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `physiotherapists_email_unique` ON `physiotherapists` (`email`);--> statement-breakpoint
CREATE TABLE `simulated_eligibility` (
	`id` text PRIMARY KEY NOT NULL,
	`physio_id` text NOT NULL,
	`region` text NOT NULL,
	`eligible_referral_sets` integer NOT NULL,
	`total_referral_sets` integer NOT NULL,
	`confidence_factors` text,
	`gaps` text,
	`simulated_at` integer NOT NULL,
	FOREIGN KEY (`physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transition_events` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`origin_episode_id` text NOT NULL,
	`origin_physio_id` text NOT NULL,
	`destination_episode_id` text,
	`destination_physio_id` text,
	`referring_gp_id` text,
	`transition_type` text NOT NULL,
	`status` text NOT NULL,
	`initiated_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_physio_id`) REFERENCES `physiotherapists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referring_gp_id`) REFERENCES `gps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`episode_id` text NOT NULL,
	`visit_date` integer NOT NULL,
	`visit_number` integer NOT NULL,
	`notes_summary` text,
	`escalated` integer DEFAULT false NOT NULL,
	`treatment_adjusted` integer DEFAULT false NOT NULL,
	`pain_score` integer,
	`function_score` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
