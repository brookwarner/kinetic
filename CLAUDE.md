# Kinetic MVP: GP Referral Routing System

## Project Overview

A Next.js application demonstrating a quality-based physiotherapist referral routing system. The platform preserves provider autonomy while building transparent referral networks between GPs and physiotherapists based on evidence-driven quality signals.

**Status**: MVP Complete (7 phases implemented)

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Turso (libsql - SQLite-compatible cloud database)
- **ORM**: Drizzle ORM with @libsql/client
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts
- **Deployment**: Vercel

## Core Architecture

### Database Schema (8 tables)

1. **physiotherapists** - Provider profiles, opt-in status, preview mode flags (`optedIn`, `previewMode`, `optedInAt`, `optedOutAt`)
2. **patients** - Patient demographics
3. **gps** - GP practice information with region codes
4. **episodes** - Treatment episodes linking patients to physios
5. **visits** - Individual treatment visits with pain/function scores
6. **consents** - Episode-scoped patient data sharing permissions
7. **computed_signals** - Quality signals (outcome, clinical decision, patient preference)
8. **simulated_eligibility** - Future referral set eligibility data

### Key Design Patterns

**All-or-Nothing Data Sharing**: Physiotherapists must share all consented episode data or none. Prevents cherry-picking and ensures signals reflect real clinical practice.

**Preview Mode**: New opt-ins automatically start in preview mode where they can verify signal computations with full numeric transparency before going live. Includes 4-step wizard flow with consent review, animated analysis, results display, and go-live decision.

**Episode-Scoped Consent**: Patient consent is per-episode and revocable, not global or permanent.

**Sets Not Rankings**: GPs see eligible physiotherapists in grids with confidence indicators (dots), never ranked lists or numeric scores.

## Application Structure

### Routes

- `/` - Landing page with role selector (physio or GP)
- `/physio/[physioId]/*` - Physiotherapist dashboard, episodes, signals, eligibility
- `/physio/[physioId]/opt-in` - Wizard-based opt-in flow (not opted in) or settings management (opted in)
- `/gp/[gpId]/*` - GP dashboard and referral set views
- `/patient/[patientId]/consent` - Patient consent management
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

### API Routes

- `/api/physio/[physioId]/consented-episodes` - GET anonymized list of consented episodes
- `/api/physio/[physioId]/signals` - GET formatted signal data
- `/api/physio/[physioId]/eligibility` - GET referral eligibility data

### Server Actions

- `/src/actions/consent.ts` - Grant/revoke episode consent
- `/src/actions/opt-in.ts` - Manage physio opt-in/out status and preview mode transitions
  - `toggleOptIn(physioId, optIn)` - Opts in/out, automatically enables preview mode when opting in. Returns `{success: true}` without redirecting. When opting out, revalidates opt-in and dashboard pages; when opting in, does NOT revalidate to prevent interrupting wizard animation flow.
  - `disablePreviewMode(physioId)` - Exits preview mode to go live in GP referral sets. Revalidates dashboard and signals pages. Returns `{success: true}` or error object.
- `/src/actions/signals.ts` - Recompute quality signals
- `/src/actions/dev-utils.ts` - Development-only utilities (not available in production)
  - `resetAllPhysiosOptIn()` - Resets all physiotherapists to not opted in state for testing opt-in flow

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

### Eligibility Simulation

Located in `/src/lib/eligibility/simulate.ts`:

Computes referral set eligibility based on:
- Region matching (GP region vs physio region)
- Signal strength across all three categories
- Episode count threshold (minimum 8 consented episodes)

## Environment Configuration

Required environment variables:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

For local development, defaults to `file:local.db`.

## Database Operations

```bash
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Drizzle Studio
npm run seed        # Seed database with demo scenarios
```

Seed creates 5 physio personas, 3 GPs, 30 patients, 59 episodes, 494 visits, and 32 consents.

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
- Three signal cards in responsive grid (outcome, clinical, preference)
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

#### Opt-In Wizard Flow

When a physiotherapist is not opted in, visiting `/physio/[physioId]/opt-in` shows a 4-step wizard (`OptInWizard`):

1. **Consent Step** - Lists consented episodes that will contribute to signals (fetched from `/api/physio/[physioId]/consented-episodes`)
2. **Analysing Step** - Animated progress bar with time-based progression (9 seconds total, 100ms update intervals):
   - 0-3s (0-33%): "Analyzing X consented episodes..."
   - 3-6s (33-66%): "Computing outcome trajectories and clinical indicators..."
   - 6-9s (66-99%): "Calculating GP referral matches in your region..."
   - During this step, `toggleOptIn` is called to opt in with preview mode enabled, then `recomputeSignals` runs
   - URL parameter `wizard=true` is added automatically to prevent premature page switching during animation
   - Minimum 9-second animation ensures smooth UX, progress completes at 100% before transitioning after +800ms delay
3. **Results Step** - Displays computed signals and eligibility data (fetched from `/api/physio/[physioId]/signals` and `/eligibility`)
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

- Practice dashboard
- Referral set grid (non-ranked) with confidence dots
- Region-based filtering
- Quality indicator visualization

### For Patients

- Episode-scoped consent form
- Grant/revoke consent actions
- Transparent data sharing scope explanation

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
- Opt-in wizard (`opt-in-wizard.tsx`) - 4-step flow with progress indicator, animated analysis (9-second time-based animation with 100ms intervals), URL parameter manipulation via `window.history.replaceState()`, parallel data fetching with `Promise.all()`, `AlertDialog` for go-live confirmation
- Settings view (`settings-view.tsx`) - Status management with confirmation dialogs
- Opt-in banner (`opt-in-banner.tsx`) - FAQ accordion and CTA interactions
- Physio sidebar (`physio-sidebar.tsx`) - Client component using `usePathname()` for active link state with exact match logic for dashboard and prefix matching for other routes
- Global reset button (`global-reset-button.tsx`) - Development utility component that calls `resetAllPhysiosOptIn()` server action and reloads page, rendered in root layout navigation

**Server Component Pattern**: Pages display data using React Server Components:
- Page header (`page-header.tsx`) - Server component receiving props from parent page, preview mode badge and "Go Live" button integrated
- All physio pages (dashboard, episodes, signals, eligibility) - Server components that fetch data and render PageHeader

**Icon Usage**: Lucide React icons used consistently across UI:
- Eye icon for preview mode badge in PageHeader
- Shield icon for all-or-nothing rule explanations
- Users icon for patient consent sections
- TrendingUp/TrendingDown/Minus icons for signal quality indicators
- Sparkles icon for opportunity/upsell messaging
- CheckCircle2 icon for success states and benefits lists
- FileText, Activity icons for dashboard stat cards and wizard steps
- Inbox icon for empty states
- ArrowRight icon for primary CTAs
- ArrowLeft icon for wizard back navigation
- Rocket icon for go-live step
- Loader2 icon for loading states and progress animations
- LayoutDashboard, Send, Settings icons for sidebar navigation items
- RotateCcw icon for development reset functionality

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
- Sidebar navigation uses wine-themed colors for active states:
  - Sidebar background: light wine tint `hsl(355 35% 98%)`
  - Active links: wine/0.1 background, wine text, 3px left border with negative margin compensation `-ml-[3px]`
  - Hover states: wine/0.05 background, wine text
  - Logo: white "K" on wine background in 8x8 rounded square
  - Border colors: wine/0.1 for visual separation
- Development utilities use orange-themed colors (orange-300 border, orange-700 text, orange-50 hover)

## Demo Scenarios

5 physiotherapist personas demonstrate different states:

1. **Dr. Sarah Chen** (physio-sarah) - Strong signals, preview mode active, high eligibility
2. **Dr. James Park** (physio-james) - Not opted in, demonstrates opportunity cost
3. **Dr. Maya Patel** (physio-maya) - Early adopter, preview mode, building confidence
4. **Dr. Tom Hughes** (physio-tom) - Mixed signals, preview mode, system honesty
5. **Dr. Aisha Rahman** (physio-aisha) - Opted out, demonstrates reversibility

## Important Files

- `/src/db/schema.ts` - Complete database schema definition
- `/src/db/seed-scenarios.ts` - Deterministic seed data scenarios
- `/src/lib/signals/compute.ts` - Signal orchestrator and computation logic
- `/src/lib/eligibility/simulate.ts` - Eligibility computation rules
- `/README.md` - User-facing documentation
- `/IMPLEMENTATION.md` - Technical implementation summary

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

- No numeric scores exposed to prevent gaming
- All-or-nothing sharing prevents cherry-picking
- Preview mode builds trust through transparency with guided onboarding
- Episode-scoped consent gives patients control
- Revocable consent prevents lock-in
- No rankings prevent unhealthy competition
- Region-based filtering prevents inappropriate referrals

## Next Steps for Production

- Add authentication (NextAuth.js or similar)
- Implement real-time signal updates on consent changes
- Add email notifications for referrals
- Build admin dashboard for system monitoring
- Add audit logging for consent changes
- Implement rate limiting and API protection
