# PRD: GP Referral Routing with Portable Episodes (MVP)

## 1. Problem Statement

Kinetic serves 1,800 independent physiotherapy clinics. Patients increasingly see multiple physios across locations and specialties, yet each clinic treats them as a brand new patient.

Practices report strong demand for shared patient context, but contribution is low due to rational competitive concerns. The core issue is **misaligned incentives**, not policy or tooling.

The system must:
- Improve patient outcomes through continuity
- Increase inbound demand stability for physios
- Avoid competitive leakage and peer judgement
- Respect patient consent and privacy

This MVP focuses on **inbound GP referrals** as the incentive lever.

---

## 2. Goals

### Primary Goal
Demonstrate a working system where **individual physios rationally opt in** to sharing context because it increases their eligibility for GP referrals.

### Secondary Goals
- Make opt-in low risk and reversible
- Prevent gaming or selective sharing
- Preserve GP autonomy in referral decisions
- Maintain patient trust through clear consent framing

### Explicit Non-Goals (MVP)
- No public rankings
- No peer comparisons
- No clinic-wide mandates
- No downstream patient routing between physios
- No full historical backfill

---

## 3. Core Insight (Design Principle)

Physios do not fear sharing information.  
They fear **unbounded loss of demand**.

This system reframes sharing as:
> A prerequisite for being confidently referable, not a gift to competitors.

---

## 4. Actors

### Physiotherapist (Individual)
- Primary decision maker for opt-in
- Owns professional identity and perceived outcomes
- Motivated by inbound demand stability

### GP (Referrer)
- Chooses a *set* of suitable physios
- Optimises for expertise, location, and capacity
- Wants confidence, not rankings

### Patient
- Owns personal health data
- Must consent
- Cares about continuity, not physio competition

---

## 5. Scope of MVP

### Opt-In Boundary (Critical)
Opt-in applies to:
- **Individual physios**
- **GP-referred patients only**
- **From opt-in date forward**
- **Only where patient consent is given**

Physios opt into a **rule**, not selective cases.

This prevents gaming while keeping the commitment small.

---

## 6. Consent Model

Patient consent is framed as:
> Supporting continuity within the healthcare system.

Not:
- Helping a physio get more work
- Sharing data with competitors

Key consent properties:
- Explicit
- Episode-scoped
- Revocable
- Clearly limited to care and referral purposes

Consent is a prerequisite, not a differentiator.

---

## 7. System Behaviors (MVP)

### 7.1 Physio Opt-In / Opt-Out

Physio can:
- Opt in to GP referral portability
- Opt out at any time (prospective only)

Opt-in means:
- All GP-referred episodes from that point are included
- No cherry-picking of patients or outcomes

Opt-out means:
- No new episodes are processed
- Existing processed data remains historical but inactive

---

### 7.2 Shadow Mode (Trust Bridge)

Upon opt-in, the system enters **Shadow Mode** by default.

In Shadow Mode:
- The system processes eligible episodes
- Signals are computed internally
- No impact on live GP referrals
- Nothing is published externally

Physio can see a **private preview** of:
- What signals the system infers
- What those signals mean
- What referral eligibility could unlock if activated

Shadow Mode exists to:
- Build trust
- Demonstrate fairness
- Make value legible

---

### 7.3 Signals (MVP Set)

Signals must be:
- Hard to game
- Derivable only from unbiased episode data
- Directional, not absolute

MVP signals include:

**Outcome Trajectory**
- Change in visit frequency over time
- Evidence of tapering with improvement
- Time to successful discharge vs unresolved self-discharge

**Clinical Decision Quality**
- Escalation to senior or specialist input
- Adjustment of treatment approach when progress stalls

**Revealed Patient Preference**
- Patients arriving after prior physio care elsewhere
- Voluntary internal handoffs that lead to improvement

Signals are:
- Used for eligibility determination
- Not shown as scores
- Not compared directly against peers

---

### 7.4 Referral Eligibility (Not Live in MVP)

In MVP:
- Signals are computed
- Eligibility is simulated
- No GP-facing experience is live

Physio sees:
- “You would appear in X referral sets in your region”
- “These signals increased confidence”
- “These gaps reduce eligibility”

This reinforces incentives without risk.

---

## 8. GP Experience (Deferred but Represented)

The MVP must *demonstrate* how this would work, even if simulated.

Key properties:
- GP is shown a **set** of physios, not a single recommendation
- The system assists but does not decide
- Signals are abstracted into confidence indicators
- No raw notes are shown

The prototype should clearly show:
- Where GP autonomy remains
- How confidence is increased without ranking

---

## 9. What Information Is Shared, and When

### Shared with System
- Structured episode data
- Visit cadence
- Discharge outcomes
- Escalation events

### Not Shared
- Raw notes with other physios
- Peer identifiable comparisons
- Commercial metrics

### When
- Only after physio opt-in
- Only after patient consent
- Only for GP-referred episodes

---

## 10. Incentive Loop (Explicit)

1. Physio opts in
2. System gains unbiased visibility
3. Physio becomes more legible and routable
4. Referral eligibility increases
5. Inbound demand stabilises
6. Non-participation has opportunity cost

No punishment.  
Only visibility and eligibility.

---

## 11. Success Criteria (Prototype)

The prototype is successful if it clearly demonstrates:

- How a physio opts in and out
- Why selective sharing is impossible
- How patient consent fits naturally
- How signals are derived without ranking
- How incentives reinforce participation
- Why a rational physio would choose to opt in

This is a **thinking prototype**, not a production system.

---

## 12. Key Risks to Surface (Explicitly)

The prototype should visibly address:
- Fear of peer judgement
- Fear of competitive undercutting
- Fear of opaque scoring
- Fear of patient data misuse

If these are not addressed, adoption will fail.

---

## 13. Open Questions (Post-MVP)

- When to activate live GP routing
- How to roll up individual participation to clinic-level
- How to expand beyond GP referrals
- Whether and how to provide formative feedback

These are intentionally out of scope.

---

## 14. Summary

This MVP demonstrates that:
- Shared context can be incentive-aligned
- Opt-in can be rational and selfish
- Patient trust can be preserved
- Routing can improve outcomes without rankings

The goal is not to solve the whole system, but to prove that **the incentive flywheel can exist at all**.
