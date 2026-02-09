# Kinetic MVP: GP Referral Routing System

## Project Overview

A Next.js application demonstrating a quality-based physiotherapist referral routing system. The platform preserves provider autonomy while building transparent referral networks between GPs and physiotherapists based on evidence-driven quality signals.

**Status**: MVP Complete (9 phases implemented - includes care continuity and GP referral flows)

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Turso (libsql - SQLite-compatible cloud database)
- **ORM**: Drizzle ORM with @libsql/client
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts
- **Deployment**: Vercel

## Core Architecture

### Database Schema (12 tables)

1. **physiotherapists** - Provider profiles, opt-in status, preview mode flags (`optedIn`, `previewMode`, `optedInAt`, `optedOutAt`)
2. **patients** - Patient demographics
3. **gps** - GP practice information with region codes
4. **episodes** - Treatment episodes linking patients to physios (`priorPhysioEpisodeId` tracks continuity chain, `status` includes "transferred")
5. **visits** - Individual treatment visits with pain/function scores
6. **consents** - Episode-scoped patient data sharing permissions
7. **computed_signals** - Quality signals (outcome, clinical decision, patient preference)
8. **simulated_eligibility** - Future referral set eligibility data
9. **gp_patient_notes** - GP clinical notes per patient for referral context
10. **transition_events** - Care transition tracking with state machine (initiated → consent-pending → summary-pending → review-pending → released/declined/expired)
11. **continuity_consents** - Patient consent for care handoff summaries (separate domain from episode consents)
12. **continuity_summaries** - Structured clinical handoff summaries with 6 sections (condition framing, diagnosis hypothesis, interventions, response profile, current status, open considerations), physio review/annotation support

### Key Design Patterns

**All-or-Nothing Data Sharing**: Physiotherapists must share all consented episode data or none. Prevents cherry-picking and ensures signals reflect real clinical practice.

**Preview Mode**: New opt-ins automatically start in preview mode where they can verify signal computations with full numeric transparency before going live. Includes 4-step wizard flow with consent review, animated analysis, results display, and go-live decision.

**Episode-Scoped Consent**: Patient consent is per-episode and revocable, not global or permanent.

**Sets Not Rankings**: GPs see eligible physiotherapists in grids with confidence indicators (dots), never ranked lists or numeric scores.

**Care Continuity Summaries**: Structured clinical handoff summaries generated from episode data using deterministic templates (no AI, no raw note passthrough). Follows state machine: patient consent → summary generation → physio review/annotation → release to destination provider. Prevents comparative statements or performance evaluation language.

## Application Structure

### Routes

- `/` - Landing page with role selector (physio or GP)
- `/physio/[physioId]/*` - Physiotherapist dashboard, episodes, signals, eligibility, handoffs
- `/physio/[physioId]/opt-in` - Wizard-based opt-in flow (not opted in) or settings management (opted in)
- `/physio/[physioId]/handoffs` - Care transition management (outgoing/incoming tabs)
- `/physio/[physioId]/handoffs/[summaryId]/review` - Review and annotate continuity summary before release
- `/gp/[gpId]/*` - GP dashboard and referral views
- `/gp/[gpId]/referral/new` - 3-step referral wizard (patient selection → physio search → confirmation)
- `/patient/[patientId]/consent` - Patient consent management (episode or continuity consent based on query params)
- `/demo` - Guided demo walkthrough

### Layouts

**Root Layout** (`/src/app/layout.tsx`):
- Global sticky navigation bar with Kinetic logo and branding
- Navigation links to demo and home pages
- Development-only global reset button (`GlobalResetButton`) for resetting all physio opt-in states
- Backdrop blur effect on navigation for visual depth

**Physio Layout** (`/src/app/physio/[physioId]/layout.tsx`):
- Minimal layout with left sidebar navigation (`PhysioSidebar`)
- Main content area with left margin (`ml-64`) for 256px fixed sidebar
- Server component that validates physio existence using Drizzle ORM query
- No preview mode banner rendered in layout (preview mode UI integrated into PageHeader component)

**GP Layout** (`/src/app/gp/[gpId]/layout.tsx`):
- Minimal layout with left sidebar navigation (`GpSidebar`) using sage/teal color scheme
- Main content area with left margin for fixed sidebar
- Server component that validates GP existence
- Recent patient list in sidebar with notes indicator

### API Routes

**Physio APIs:**
- `/api/physio/[physioId]/consented-episodes` - GET anonymized list of consented episodes
- `/api/physio/[physioId]/signals` - GET formatted signal data
- `/api/physio/[physioId]/eligibility` - GET referral eligibility data
- `/api/physio/[physioId]/transitions` - GET enriched transition events (outgoing/incoming)
- `/api/physio/[physioId]/summaries/[summaryId]` - GET continuity summary with access control (origin physio: full access; destination physio: only if released)

**GP APIs:**
- `/api/gp/[gpId]/patients` - GET patients in GP's region with clinical notes
- `/api/gp/[gpId]/find-physios` - POST search for eligible physiotherapists with signal data, region matching, capacity sorting

### Server Actions

**Consent Actions** (`/src/actions/consent.ts`):
- `grantConsent(patientId, episodeId, physioId)` - Grant episode-scoped consent
- `revokeConsent(consentId)` - Revoke episode consent

**Opt-In Actions** (`/src/actions/opt-in.ts`):
- `toggleOptIn(physioId, optIn)` - Opts in/out, automatically enables preview mode when opting in. Returns `{success: true}` without redirecting. When opting out, revalidates opt-in and dashboard pages; when opting in, does NOT revalidate to prevent interrupting wizard animation flow.
- `disablePreviewMode(physioId)` - Exits preview mode to go live in GP referral sets. Revalidates dashboard and signals pages. Returns `{success: true}` or error object.

**Transition Actions** (`/src/actions/transitions.ts`):
- `initiateTransition({originEpisodeId, transitionType, destinationPhysioId?, referringGpId?})` - Create transition event, update episode status to "transferred"
- `grantContinuityConsent(patientId, transitionEventId, originEpisodeId)` - Patient grants consent, generates summary using `generateSummary()`, advances transition to review-pending
- `revokeContinuityConsent(consentId)` - Revoke consent, revoke summary, update transition to declined

**Summary Review Actions** (`/src/actions/summary-review.ts`):
- `approveSummary(summaryId, physioAnnotations?)` - Approve summary with optional annotations
- `releaseSummary(summaryId)` - Release approved summary to destination physio, update transition to released

**GP Referral Actions** (`/src/actions/gp-referrals.ts`):
- `createGpReferral({gpId, patientId, destinationPhysioId, condition, originEpisodeId?})` - Create new episode with `isGpReferred=true`, create transition event if prior episode exists

**Signal Actions** (`/src/actions/signals.ts`):
- `recomputeSignals(physioId)` - Recompute quality signals

**Dev Utilities** (`/src/actions/dev-utils.ts`):
- `resetAllPhysiosOptIn()` - Development-only: Resets all physiotherapists to not opted in state

### Signal Computation Engine

Located in `/src/lib/signals/`:

1. **Outcome Trajectory** - Pain reduction, function improvement, visit tapering
2. **Clinical Decision Quality** - Escalation timing and responsiveness
3. **Patient Preference** - Inbound transfers, retention, handoff quality

Each signal returns 0-1 value with confidence score. UI displays directional indicators ("Positive Trend", "Emerging Pattern", "Building Data") instead of numeric scores.

**Signal Display Logic** (`SignalCard` component):
- **Positive Trend**: value ≥70 AND confidence ≠ low → Green icons, "Positive Trend" text
- **Emerging Pattern**: 50 ≤ value < 70 AND confidence ≠ low → Amber icons, "Emerging Pattern" text
- **Building Data**: confidence = low → Amber icons, "Building Data" text
- **Needs Attention**: value < 50 AND confidence ≠ low → Slate icons, "Needs Attention" text

Display hierarchy: Large colored quality indicator text (3xl font) is dominant, confidence level and episode count are secondary context (small muted text).

**Benchmark Integration** (`SignalCard` with benchmarkSummary prop):
- Percentile pill badge displays below quality indicator (secondary context)
- Color coding: green (above median), slate (at median), amber (below median)
- Format: "Xth percentile" in small font with colored background/border

### Benchmark System (Demo Only)

Located in `/src/lib/signals/benchmark-data.ts`:

Hardcoded benchmark data simulating AI-analyzed percentile comparisons without real computation.

**Data Structure**:
- `PhysioBenchmarkData`: Overall percentile (0-100th), categories with signals
- `BenchmarkCategory`: 6 categories with icon names, summary, signals array
- `BenchmarkSignal`: Label, description, values, percentile, status (above/at/below), AI insight

**Categories**:
1. Clinical Outcomes (Activity icon, green) - Recovery rate, time to outcome, re-injury
2. Evidence & Technique (BookOpen icon, blue) - Evidence alignment, technique breadth, visit patterns
3. Patient Journey (Route icon, amber) - Self-discharge, no-shows, time to first appointment
4. Patient Engagement (Heart icon, purple) - Satisfaction, adherence, communication
5. Practice Network (Network icon, teal) - Referral partnerships, collaboration
6. Safety & Equity (ShieldCheck icon, slate) - Adverse events, equity measures

**Helper Functions**:
- `getBenchmarkSignals(physioId)` - Returns full benchmark data for physio
- `getBenchmarkForSignalType(physioId, signalType)` - Returns benchmark for specific signal
- `getTopBenchmarkSignal(physioId)` - Returns highest-performing signal

**Display Components**:
- `BenchmarkDetailPanel` - Accordion-style category breakdown with percentile bars, median markers (50th), signal-level details, AI insights, methodology footer
- `SignalCard` with `benchmarkSummary` - Small percentile pill integrated into signal cards
- `PhysioResultCard` with `benchmarkPercentile` - GP-facing summary showing overall percentile and top signal

### Eligibility Simulation

Located in `/src/lib/eligibility/simulate.ts`:

Computes referral set eligibility based on:
- Region matching (GP region vs physio region)
- Signal strength across all three categories
- Episode count threshold (minimum 8 consented episodes)

### Continuity Summary Engine

Located in `/src/lib/continuity/`:

**Pure Function Pipeline** (`generate-summary.ts`):
- Transforms episode + visits data into structured handoff document
- No AI generation, no raw note passthrough, no comparative statements
- Deterministic templates enforce consistent clinical framing
- 6-section structure: condition framing, diagnosis hypothesis, interventions attempted, response profile (responded/did not respond lists), current status, open considerations

**Type System** (`types.ts`):
- `SummaryInput`, `SummaryContent`, `ResponseProfile` interfaces
- State machine definitions for `TransitionStatus` and `SummaryStatus`
- Validation functions: `isValidTransition()`, `isValidSummaryTransition()`

**Template Functions** (`summary-templates.ts`):
- `formatConditionFraming()` - Patient presentation and symptom trajectory
- `formatDiagnosisHypothesis()` - Working diagnosis based on response patterns
- `extractInterventions()` - Treatment approaches attempted
- `analyzeResponses()` - Categorize interventions by response
- `formatCurrentStatus()` - Current functional state
- `identifyOpenConsiderations()` - Unresolved clinical questions

## Environment Configuration

Required environment variables:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

For local development, defaults to `file:local.db`. When `TURSO_DATABASE_URL` is unset or empty, the seed script automatically treats the database as local.

## Database Operations

```bash
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Drizzle Studio
npm run seed        # Seed database with demo scenarios (loads env files via @next/env, connects to configured DB)
```

Seed creates 5 physio personas, 3 GPs, 30 patients, 59 episodes, 494 visits, and 32 consents.

**Seed Script Behavior**: The seed script (`/src/db/seed.ts`) loads environment variables using `@next/env` to match Next.js behavior:
- Automatically loads `.env`, `.env.local`, and other Next.js env files before connecting to the database
- Treats database as local when `TURSO_DATABASE_URL` is unset, empty, or starts with `file:`, `http://localhost`, or `https://localhost`
- Requires `ALLOW_REMOTE_SEED=true` environment variable to seed remote/production databases
- Prevents accidental data overwrites on cloud databases
- Running `npm run seed` connects to whatever database is configured in your env files (local or remote)

## Key Features

### For Physiotherapists

- Opt-in wizard flow (not opted in) or settings management (opted in)
- Opt-in/out toggle with confirmation dialogs and detailed explanations
- Episode list with consent status filtering
- Episode detail with visit timeline visualization
- Quality signal dashboard with refined typography and integrated preview mode controls
- Referral eligibility page with opportunity upsell for non-opted-in users
- Unified page header component across all physio pages

**Page Header Pattern** (`PageHeader` component):
All physio pages (dashboard, episodes, signals, eligibility) use a consistent header component that displays:
- Welcome message with physio name and inline preview mode badge (amber-100 background, amber-600 eye icon, "Preview Mode" text)
- Page title (serif, 4xl, tracking-tight)
- Page description (contextual metadata)
- Optional action buttons (e.g., "Recompute Signals", custom CTAs)
- "Go Live" button (amber-600 background, small size) when in preview mode that links to settings
- Bottom border separator for visual separation

This replaces the previous approach of a sticky top header with separate preview mode banner.

**Quality Signals Page** (`/physio/[physioId]/signals`):
- PageHeader component with preview mode integration
- Three signal cards in responsive grid (outcome, clinical, preference) with benchmark percentile badges
- BenchmarkDetailPanel component displayed below signal grid with full category breakdown
- Recompute signals button passed as header action
- Empty state redirect to opt-in flow for non-opted-in users
- Preview mode technical details section (only visible when previewMode=true)

**GP Referrals/Eligibility Page** (`/physio/[physioId]/eligibility`):
- PageHeader component with contextual description based on opt-in status
- **Not opted in**: Shows empty state + opportunity upsell card with:
  - Big number display of eligible GP practices (based on simulation)
  - Benefits list with CheckCircle2 icons
  - Peach-to-white gradient background with wine accent borders
  - "Start Receiving Referrals" CTA with Sparkles icon
- **Opted in**: Shows success state + eligibility meter
- MVP state: No actual referrals yet, shows preparedness messaging

**Episodes Page** (`/physio/[physioId]/episodes`):
- PageHeader with episode count summary (total episodes, GP-referred count)
- Stats grid showing active, discharged, GP-referred, and self-discharged counts
- Episodes list with blue left border for GP-referred episodes
- Links to episode detail pages

**Dashboard Page** (`/physio/[physioId]/page`):
- PageHeader with clinic name and region
- OptInBanner for non-opted-in users
- Stats grid (total episodes, consent rate, signal status, eligibility)
- Quick links to episodes, signals, and eligibility pages

**Handoffs Page** (`/physio/[physioId]/handoffs`):
- PageHeader with transition count summary (outgoing/incoming)
- Tab switcher for outgoing vs incoming transitions
- Transition cards with status badges (awaiting consent, generating summary, pending review, released, declined, expired)
- Transition type badges (GP referral, patient booking, physio handoff)
- Color-coded status indicators using amber (pending), purple (review), green (released), red (declined)
- Links to summary review page for review-pending items
- Empty state with Inbox icon when no transitions exist

**Summary Review Page** (`/physio/[physioId]/handoffs/[summaryId]/review`):
- Full continuity summary display with 6 sections in card layout
- Physio annotation textarea for adding clinical context
- Approve + Release buttons (teal theme)
- Access control: origin physio only (destination sees released summaries)
- Summary status badges and metadata display

#### Opt-In Wizard Flow

When a physiotherapist is not opted in, visiting `/physio/[physioId]/opt-in` shows a 4-step wizard (`OptInWizard`):

1. **Consent Step** - Lists consented episodes that will contribute to signals (fetched from `/api/physio/[physioId]/consented-episodes`)
2. **Analysing Step** - Animated progress bar with time-based progression (9 seconds total, 100ms update intervals, 4 phases):
   - 0-2.5s (0-28%): "Analyzing clinical notes from X consented episodes..."
   - 2.5-5s (28-53%): "Computing outcome trajectories and clinical indicators..."
   - 5-7s (53-77%): "Matching quality signals to regional benchmarks..."
   - 7-9s (77-99%): "Comparing against industry and peer benchmarks..."
   - During this step, `toggleOptIn` is called to opt in with preview mode enabled, then `recomputeSignals` runs
   - URL parameter `wizard=true` is added automatically to prevent premature page switching during animation
   - Minimum 9-second animation ensures smooth UX, progress completes at 100% before transitioning after +800ms delay
3. **Results Step** - Displays computed signals with benchmark percentiles and eligibility data (fetched from `/api/physio/[physioId]/signals` and `/eligibility`)
4. **Go-Live Step** - Decision point to exit preview mode (calls `disablePreviewMode` and removes wizard parameter, redirects to dashboard) or continue exploring

**Wizard State Management**: The wizard automatically adds `?wizard=true` URL parameter using `window.history.replaceState()` when starting the analysis step. This prevents the page from switching to `SettingsView` mid-flow when `toggleOptIn` completes during the analysis animation.

When already opted in (and no wizard parameter), the same route shows `SettingsView` with:
- Current status display (opted in, preview mode state)
- "Go Live" button to exit preview mode (calls `disablePreviewMode`)
- Opt-out option with confirmation dialog
- All-or-nothing rule reminder

#### Opt-In Banner

For physiotherapists not opted in, `OptInBanner` (`/src/components/physio/opt-in-banner.tsx`) appears on dashboard:
- Benefits grid (more referrals, better matches, preview first, privacy)
- FAQ accordion addressing benefits and objections
- "Start Preview" CTA leading to wizard flow

#### Preview Mode Indicator

Preview mode status is integrated into the `PageHeader` component (not a separate banner):
- Amber rounded pill badge with eye icon appears next to welcome message
- "Go Live" button (amber, small size) in header actions area
- Links to settings page (`/physio/[physioId]/opt-in`) where user can call `disablePreviewMode`
- Consistent across all physio pages (dashboard, episodes, signals, eligibility)

### For GPs

**Dashboard** (`/gp/[gpId]/page`):
- Sage/teal themed design distinct from physio wine theme
- Stats grid with total patients and referrals sent
- Quick actions: "New Referral" CTA button
- Recent patients list with clinical notes
- Success state messaging when referral completed

**Referral Wizard** (`/gp/[gpId]/referral/new`):
- 3-step client-side wizard (`NewReferralWizard`) with visual progress indicator showing completed/current/upcoming steps
- **Step 1 - Patient Selection**:
  - Two-column grid layout: patient list (left) + clinical notes (right)
  - Loads patients via `/api/gp/${gpId}/patients` on mount with loading state
  - `PatientCard` components for selection with visual checkmark indicator
  - Editable `Textarea` for clinical notes (pre-filled from patient.notes)
  - "Find Physiotherapists" button disabled until patient selected
  - Cancel button returns to GP dashboard
- **Step 2 - Searching**:
  - 6-second time-based animated progress (100ms update intervals, 4 phases)
  - Four phases with stage text updates:
    - 0-1.5s (0-25%): "Reviewing patient history..."
    - 1.5-3s (25-50%): "Analyzing local physiotherapists..."
    - 3-4.5s (50-75%): "Checking quality benchmarks..."
    - 4.5-6s (75-99%): "Matching quality to patient needs..."
  - Progress bar with percentage display
  - Stage indicator icons (FileText → Loader2 → CheckCircle2 as phases complete)
  - Parallel async fetch to `/api/gp/${gpId}/find-physios` (POST with patientRegion)
  - Transitions to results at 6s + 600ms delay regardless of API status
- **Step 3 - Results**:
  - Grid of `PhysioResultCard` components showing top eligible matches
  - Cards display: name, clinic, region badge, capacity status, specialty tags, signal confidence dots, benchmark percentile summary
  - Benchmark section shows overall percentile with bar graph and median marker, plus top signal name/percentile
  - "Begin Referral" button per card triggers confirmation dialog
  - Confirmation dialog shows physio name and practice details
  - On confirm: 1s simulated delay, navigate to dashboard with `?referral=success` query param
- Demo mode: simulates referral creation without database write, uses client-side state only

**Physio Result Cards** (`PhysioResultCard` component):
- Region indicator badge with visual distinction for same-region matches
- Capacity status badges (available/limited/waitlist) with color coding
- Signal confidence dots (3 dots: outcome, clinical, patient preference) using `ConfidenceIndicator`
- Benchmark performance section (slate-50 background) with:
  - Overall percentile display (Xth percentile) in sage color
  - Horizontal percentile bar with sage gradient and median marker (50th line)
  - Top signal name and percentile in small muted text
- Specialty tags displayed as chips
- "Begin Referral" CTA button with sage theme (`.btn-gp`)
- Used in referral wizard step 3 results display

**Patient Cards** (`PatientCard` component):
- Name, date of birth, region display
- "Has notes" indicator badge when patient.notes exists
- Selectable card UI with click handler
- Visual selected state with checkmark indicator and border highlighting
- Used in referral wizard step 1

### For Patients

**Consent Page** (`/patient/[patientId]/consent`):
- Dual-mode based on query parameters:
  - `?episode=X` - Episode-scoped consent form for quality signals (`ConsentForm`)
  - `?transition=X` - Care transition consent for continuity summary (`ContinuityConsentForm`)
- Episode consent scope: anonymized visit data for quality signal computation
- Continuity consent scope: structured clinical summary for care handoff
- Grant/revoke actions with confirmation dialogs
- Transparent data sharing scope explanations
- Current consent status display with grant/revoke timestamps

## Code Patterns to Follow

### Server Components by Default

Pages are React Server Components. Use `"use client"` only when needed for interactivity.

### Server Actions for Mutations

All data mutations use Server Actions (marked with `"use server"`). Include `revalidatePath()` calls to refresh affected pages.

### API Routes for Data Fetching

Client-side components fetch data from API routes (not Server Actions) to enable progressive loading:
- `/api/physio/[physioId]/consented-episodes` - Returns anonymized episode list
- `/api/physio/[physioId]/signals` - Returns formatted signal data
- `/api/physio/[physioId]/eligibility` - Returns eligibility computation

Pattern: Server Actions for mutations, API routes for client-side data fetching in wizards/interactive flows.

### Type Safety

All database queries use Drizzle ORM with full TypeScript inference. Schema types are exported from `/src/db/schema.ts`.

### UI Components

Use shadcn/ui components from `/src/components/ui/`. Custom components follow Tailwind utility-first patterns with HSL color variables.

**Client-Side Interactivity Pattern**: Pages requiring state management (forms, animations, dialogs) use `"use client"` directive:
- Opt-in wizard (`opt-in-wizard.tsx`) - 4-step flow with progress indicator, animated analysis (9-second time-based animation with 100ms intervals, 4 phases including benchmark matching), URL parameter manipulation via `window.history.replaceState()`, parallel data fetching with `Promise.all()`, `AlertDialog` for go-live confirmation, imports `getBenchmarkSignals` for results display
- Referral wizard (`new-referral-wizard.tsx`) - 3-step flow (patient → searching → results), state management with `useState` for step progression and form data, 6-second time-based search animation (100ms intervals, 4 phases: 0-1.5s patient review, 1.5-3s physio analysis, 3-4.5s benchmark checking, 4.5-6s quality matching), parallel physio search using async/await pattern with `searchPromise`, progress indicator with step completion tracking, confirmation dialog before referral creation with demo-mode simulation (1s delay, no database write), imports `getTopBenchmarkSignal` for card display
- Benchmark detail panel (`benchmark-detail-panel.tsx`) - Accordion component for category-level benchmark breakdown with expand/collapse state, percentile bars, status badges, AI insights
- Settings view (`settings-view.tsx`) - Status management with confirmation dialogs
- Opt-in banner (`opt-in-banner.tsx`) - FAQ accordion and CTA interactions
- Physio sidebar (`physio-sidebar.tsx`) - Client component using `usePathname()` for active link state with exact match logic for dashboard and prefix matching for other routes
- GP sidebar (`gp-sidebar.tsx`) - Client component with sage/teal theme, recent patients list, "New Referral" CTA
- Continuity consent form (`continuity-consent-form.tsx`) - Grant/revoke consent with confirmation dialogs
- Global reset button (`global-reset-button.tsx`) - Development utility component that calls `resetAllPhysiosOptIn()` server action and reloads page, rendered in root layout navigation

**Server Component Pattern**: Pages display data using React Server Components:
- Page header (`page-header.tsx`) - Server component receiving props from parent page, preview mode badge and "Go Live" button integrated
- All physio pages (dashboard, episodes, signals, eligibility) - Server components that fetch data and render PageHeader

**Icon Usage**: Lucide React icons used consistently across UI:
- Eye icon for preview mode badge in PageHeader
- Shield icon for all-or-nothing rule explanations
- Users/User icon for patient consent sections and patient cards
- TrendingUp/TrendingDown/Minus icons for signal quality indicators
- Sparkles icon for opportunity/upsell messaging
- CheckCircle2 icon for success states and benefits lists
- FileText, Activity icons for dashboard stat cards and wizard steps
- Inbox icon for empty states
- ArrowRight icon for primary CTAs
- ArrowLeft icon for wizard back navigation and page navigation
- ArrowRightLeft icon for care transitions/handoffs
- Rocket icon for go-live step
- Loader2 icon for loading states and progress animations
- Search icon for physio search step in referral wizard
- Send icon for referral/handoff features in sidebar navigation
- Plus icon for "New Referral" CTA buttons
- Clock icon for pending/in-progress states
- LayoutDashboard, Settings icons for sidebar navigation items
- RotateCcw icon for development reset functionality
- BarChart3 icon for benchmark indicators and performance metrics
- Brain icon for AI methodology explanations in benchmark panel
- ChevronDown icon for accordion expand/collapse in benchmark panel
- BookOpen, Route, Heart, Network, ShieldCheck icons for benchmark category identification

## Color System

Custom color palette defined in `globals.css` using HSL variables:

- `--kinetic-wine: 355 35% 45%` - Primary brand color (burgundy) - Used for primary actions, headings, emphasis
- `--kinetic-burgundy-dark: 355 40% 35%` - Darker wine shade for gradients
- `--kinetic-peach: 25 45% 88%` - Accent color for preview mode UI elements, banners, secondary highlights
- `--kinetic-cream: 30 25% 96%` - Warm background color
- Standard shadcn theme colors (background, foreground, muted, etc.)

**Typography System**:
- **Serif font**: "Crimson Pro" (Google Fonts) - Used for headings, h1-h6 tags
- **Sans-serif font**: "DM Sans" (Google Fonts) - Used for body text, UI elements
- Headings use font-weight 600, letter-spacing -0.02em by default

**Color Usage Pattern**:
- Preview mode features use peach/amber tones (amber-50, amber-100, amber-600, amber-700) to distinguish from live features
- Primary actions and headings use wine color with `hsl(var(--kinetic-wine))` or `.btn-kinetic` class
- Opt-in upsells use gradient backgrounds: `from-[hsl(var(--kinetic-peach))] to-white`
- Signal quality indicators use semantic colors:
  - Positive trends: green-50, green-600, green-700
  - Emerging patterns: amber-50, amber-600, amber-700
  - Needs attention: slate-50, slate-600, slate-700
- Confidence dots use opacity variations on wine/green colors
- **Physio sidebar** uses wine-themed colors:
  - Sidebar background: light wine tint `hsl(355 35% 98%)`
  - Active links: wine/0.1 background, wine text, 3px left border with negative margin compensation `-ml-[3px]`
  - Hover states: wine/0.05 background, wine text
  - Logo: white "K" on wine background in 8x8 rounded square
  - Border colors: wine/0.1 for visual separation
- **GP sidebar and features** use sage/teal theme (distinct from physio wine):
  - `--kinetic-sage: 160 25% 45%` - Primary GP color
  - `--kinetic-sage-light: 160 20% 95%` - Light backgrounds
  - `--kinetic-sage-dark: 160 30% 35%` - Darker accents
  - `.btn-gp` class for GP-specific buttons (sage background)
  - Sidebar background: `hsl(160 20% 98%)`
  - Active links: sage/0.1 background, sage text, 3px left border
- **Transition status badges**:
  - Consent-pending: amber-50 bg, amber-700 text, amber-200 border
  - Summary-pending: blue-50 bg, blue-700 text, blue-200 border
  - Review-pending: purple-50 bg, purple-700 text, purple-200 border
  - Released: green-50 bg, green-700 text, green-200 border
  - Declined: red-50 bg, red-700 text, red-200 border
  - Expired: slate-50 bg, slate-700 text, slate-200 border
- **Benchmark status indicators**:
  - Above median: green-50 bg, green-700 text, green-200 border
  - At median: slate-50 bg, slate-700 text, slate-200 border
  - Below median: amber-50 bg, amber-700 text, amber-200 border
  - Percentile bars: wine for physio view, sage for GP view, with median marker line at 50th
- **Benchmark category colors** (BenchmarkDetailPanel):
  - Clinical Outcomes: green-50 bg, green-700 text, green-600 accent
  - Evidence & Technique: blue-50 bg, blue-700 text, blue-600 accent
  - Patient Journey: amber-50 bg, amber-700 text, amber-600 accent
  - Patient Engagement: purple-50 bg, purple-700 text, purple-600 accent
  - Practice Network: teal-50 bg, teal-700 text, teal-600 accent
  - Safety & Equity: slate-50 bg, slate-700 text, slate-600 accent
- Development utilities use orange-themed colors (orange-300 border, orange-700 text, orange-50 hover)

## Demo Scenarios

5 physiotherapist personas demonstrate different states:

1. **Dr. Sarah Chen** (physio-sarah) - Strong signals, preview mode active, high eligibility
2. **Dr. James Park** (physio-james) - Not opted in, demonstrates opportunity cost
3. **Dr. Maya Patel** (physio-maya) - Early adopter, preview mode, building confidence
4. **Dr. Tom Hughes** (physio-tom) - Mixed signals, preview mode, system honesty
5. **Dr. Aisha Rahman** (physio-aisha) - Opted out, demonstrates reversibility

## Important Files

**Database & Schema:**
- `/src/db/schema.ts` - Complete database schema definition (12 tables)
- `/src/db/seed-scenarios.ts` - Deterministic seed data scenarios

**Core Logic:**
- `/src/lib/signals/compute.ts` - Signal orchestrator and computation logic
- `/src/lib/signals/benchmark-data.ts` - Hardcoded benchmark data (demo only), percentile rankings, category definitions
- `/src/lib/eligibility/simulate.ts` - Eligibility computation rules
- `/src/lib/continuity/generate-summary.ts` - Continuity summary generation engine
- `/src/lib/continuity/summary-templates.ts` - Template functions for summary sections
- `/src/lib/continuity/types.ts` - Type definitions and state machine validators

**Server Actions:**
- `/src/actions/transitions.ts` - Transition and continuity consent management
- `/src/actions/summary-review.ts` - Summary approval and release
- `/src/actions/gp-referrals.ts` - GP referral creation
- `/src/actions/consent.ts` - Episode consent management
- `/src/actions/opt-in.ts` - Physio opt-in/preview mode
- `/src/actions/signals.ts` - Signal computation

**Key Components:**
- `/src/components/physio/page-header.tsx` - Unified physio page header
- `/src/components/physio/signal-card.tsx` - Signal display with benchmark percentile integration
- `/src/components/physio/benchmark-detail-panel.tsx` - Accordion-style benchmark category breakdown
- `/src/components/gp/gp-sidebar.tsx` - GP navigation with sage theme
- `/src/components/gp/physio-result-card.tsx` - Physio match card with benchmark performance section
- `/src/app/gp/[gpId]/referral/new/new-referral-wizard.tsx` - 3-step referral flow with benchmark checking
- `/src/components/patient/continuity-consent-form.tsx` - Care transition consent

**Documentation:**
- `/README.md` - User-facing documentation
- `/IMPLEMENTATION.md` - Technical implementation summary
- `/CLAUDE.md` - This file (project instructions for AI coding assistants)

## Development Workflow

1. Make schema changes in `/src/db/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update seed script if needed
4. Run `npm run seed` to reset data
5. Test in dev server (`npm run dev`)

## Deployment Notes

The application is designed for Vercel deployment with Turso cloud database. Set environment variables in Vercel dashboard before deploying.

Local SQLite file (`local.db`) is used for development and gitignored.

## Risk Mitigation Features

**Quality Signal Protections:**
- No numeric scores exposed to prevent gaming
- All-or-nothing sharing prevents cherry-picking
- Preview mode builds trust through transparency with guided onboarding
- Episode-scoped consent gives patients control
- Revocable consent prevents lock-in
- No rankings prevent unhealthy competition
- Region-based filtering prevents inappropriate referrals

**Continuity Summary Protections:**
- Deterministic templates prevent narrative manipulation (no AI generation)
- No raw clinical notes passthrough (sanitized by templates)
- No comparative statements between providers
- No performance evaluation language
- Patient consent required for each transition
- Physio review/annotation before release
- Access control: destination physio only sees released summaries
- State machine enforces proper workflow: consent → generation → review → release
- Summary revocation possible at any stage before release

## Next Steps for Production

- Add authentication (NextAuth.js or similar)
- Implement real-time signal updates on consent changes
- Add email notifications for referrals
- Build admin dashboard for system monitoring
- Add audit logging for consent changes
- Implement rate limiting and API protection
