# Kinetic MVP: GP Referral Routing with Portable Episodes

A demonstration of a GP referral routing system that preserves physiotherapist autonomy while creating a quality-based referral network.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Turso (libsql — hosted SQLite-compatible)
- **ORM:** Drizzle ORM with `@libsql/client`
- **Charts:** Recharts
- **Deployment:** Vercel

## Key Features

### For Physiotherapists

1. **All-or-nothing opt-in:** Share all episode data (with patient consent) or none
2. **Shadow mode:** See exactly what signals the system computes before going live
3. **Patient consent:** Episode-scoped, revocable consent for data sharing
4. **Quality signals:** Three signal types computed from consented episodes:
   - Outcome Trajectory (pain reduction, function improvement, visit tapering)
   - Clinical Decision Quality (escalation timing, treatment adjustments)
   - Patient Preference (inbound transfers, retention)
5. **Referral eligibility:** See which GP referral sets you would appear in
6. **No rankings:** Signals are never compared to other physios

### For GPs

1. **Referral sets (not ranked lists):** Eligible physios shown in a grid
2. **Confidence indicators:** Dots show signal strength, not numeric scores
3. **Region-based:** Only physios in your region appear
4. **GP choice:** You decide who to refer to based on patient needs

### For Patients

1. **Episode-scoped consent:** Consent per episode, not globally
2. **Revocable:** Withdraw consent at any time
3. **Transparent:** Know exactly what data is shared (structured data only)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# For local development
cp .env.example .env
```

The default `.env` uses a local SQLite file (`file:local.db`). For Turso cloud:

```bash
# Create a Turso database
turso db create kinetic

# Get connection details
turso db show kinetic

# Update .env with your Turso credentials
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

4. Push database schema:

```bash
npm run db:push
```

5. Seed the database:

```bash
npm run seed
```

This creates 5 physiotherapist scenarios, 3 GPs, 30 patients, and computes initial signals.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
kinetic/
  src/
    app/                        # Next.js App Router pages
      physio/[physioId]/        # Physiotherapist views
      gp/[gpId]/                # GP views
      patient/[patientId]/      # Patient consent views
      demo/                     # Guided demo
    components/
      physio/                   # Physio-specific components
      gp/                       # GP-specific components
      patient/                  # Patient-specific components
      ui/                       # shadcn/ui components
    db/
      schema.ts                 # Drizzle schema
      index.ts                  # DB connection
      seed.ts                   # Seed script
      seed-scenarios.ts         # Scenario definitions
    lib/
      signals/                  # Signal computation engine
      eligibility/              # Referral eligibility simulation
    actions/                    # Server Actions
```

## Demo Scenarios

The seed script creates 5 physiotherapist personas:

1. **Dr. Sarah Chen** (physio-sarah)
   - Strong performer, opted in, shadow mode
   - 15 episodes with good signals
   - High eligibility for referral sets

2. **Dr. James Park** (physio-james)
   - Good performer, NOT opted in
   - Demonstrates opportunity cost (invisible to system)
   - 12 episodes but 0 eligibility

3. **Dr. Maya Patel** (physio-maya)
   - Recently opted in, building data
   - 8 episodes with emerging signals
   - Lower confidence, medium eligibility

4. **Dr. Tom Hughes** (physio-tom)
   - Opted in with mixed signals
   - Demonstrates system honesty (not all green)
   - 14 episodes with varied outcomes

5. **Dr. Aisha Rahman** (physio-aisha)
   - Opted out after trying
   - Demonstrates reversibility
   - Data preserved but inactive

## Key Design Decisions

### No Numeric Scores in UI

Users never see numeric scores (0-100 values). Instead, they see directional indicators:
- "Positive Trend" (strong signal with high confidence)
- "Emerging Pattern" (moderate signal or medium confidence)
- "Building Data" (low confidence or needs more episodes)

This prevents gaming and focuses on quality patterns, not rankings.

### Shadow Mode Transparency

When physios first opt in, they start in shadow mode where they can:
- See exact signal computations with numeric breakdowns
- Verify the system is computing fairly
- Build confidence before going live

### Sets, Not Rankings

GPs see eligible physios in a **grid** (not a ranked list) with confidence dots. There's no "best" physiotherapist — only eligible ones. GPs choose based on patient needs and specialty match.

### All-or-Nothing Rule

Physios cannot selectively share only their "best" episodes. This prevents cherry-picking and ensures signals reflect real clinical practice.

## Database Schema

Key tables:
- `physiotherapists` — Physio profiles, opt-in status, shadow mode
- `patients` — Patient demographics
- `gps` — GP practice information
- `episodes` — Patient episodes with physios
- `visits` — Individual treatment visits with scores
- `consents` — Episode-scoped patient consent
- `computed_signals` — Quality signals for each physio
- `simulated_eligibility` — Referral set eligibility (future)

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy

The app will be available at `your-project.vercel.app`.

### Seed Production Database

After deployment, run the seed script remotely:

```bash
npm run seed
```

This will populate your Turso database with demo scenarios.

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## License

MIT

## Credits

Built as a demonstration MVP based on the Kinetic PRD. Implements a quality-based physiotherapist referral system with portable episodes and transparent signal computation.
