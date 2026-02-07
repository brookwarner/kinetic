PRD: Consent‑Scoped Continuity Summaries (Shared Patient History Extension)

1. Context

This PRD defines the logical extension to the GP Referral Routing MVP. The MVP successfully aligned incentives by making episode‑level data legible to the system without exposing physios to competitive risk or peer judgement.

This extension introduces explicit shared patient history, while preserving the incentive alignment and trust established in the MVP.

The extension must only be viable because the MVP exists. It must not undermine opt‑in rates, reintroduce adversarial dynamics, or rely on altruism.

⸻

2. Problem Statement

Patients increasingly move between physios across clinics, locations, and specialties. When this happens:
	•	Context is lost
	•	Patients repeat their story
	•	Treatment is restarted unnecessarily
	•	Outcomes degrade

Clinics have asked for shared patient history, but raw note sharing fails due to:
	•	Fear of helping patients switch
	•	Fear of professional judgement
	•	Fear of misrepresentation

The system needs to enable meaningful continuity without exposing practitioners to ambient scrutiny or competitive leakage.

⸻

3. Goals

Primary Goal

Enable shared patient history at transition moments in a way that:
	•	Improves continuity and outcomes
	•	Preserves physio trust
	•	Maintains selfish, rational participation

Secondary Goals
	•	Keep patient ownership and consent explicit
	•	Prevent selective sharing or gaming
	•	Avoid peer‑to‑peer browsing of records

Non‑Goals
	•	No open cross‑clinic note access
	•	No longitudinal peer visibility
	•	No retroactive exposure of historical care
	•	No rankings or performance comparisons

⸻

4. Core Design Principle

Shared history is event‑triggered, not ambient.

Patient history becomes visible only when a transition occurs, and only in a structured, bounded form designed for clinical handoff.

This is not a record‑sharing system. It is a continuity system.

⸻

5. Actors

Patient
	•	Owns health data
	•	Initiates or confirms transitions
	•	Grants explicit consent for continuity

Originating Physio
	•	Delivered prior episode of care
	•	Reviews and releases continuity summary
	•	Not exposed to peer judgement

Receiving Physio
	•	Receives structured context
	•	Does not access raw notes
	•	Uses summary to continue care

⸻

6. Trigger Conditions (Critical)

A Continuity Summary is generated only when one of the following occurs:
	•	A GP referral to a new physio
	•	A patient books with a new physio
	•	An explicit physio‑initiated handoff

There is no passive access to history.

⸻

7. Consent Model

Consent Framing

Consent is framed as:

Supporting continuity within the healthcare system.

Not as:
	•	Helping a physio
	•	Sharing with competitors
	•	Commercial participation

Consent Properties
	•	Episode‑scoped
	•	Transition‑specific
	•	Explicit and revocable
	•	Required for summary release

Consent is requested at the moment a transition is detected or initiated.

⸻

8. Continuity Summary Artifact

Definition

A Continuity Summary is a structured clinical handoff document representing a completed or in‑progress episode of care.

It is generated from the same unbiased episode data used in the MVP signal system.

Contents (MVP)
	•	Injury or condition framing
	•	Diagnosis hypothesis
	•	Interventions attempted
	•	What responded vs did not
	•	Current status
	•	Open considerations or watch‑outs

Explicit Exclusions
	•	Raw session notes
	•	Internal commentary
	•	Comparative statements
	•	Performance evaluation

⸻

9. Summary Generation and Review

Generation
	•	System generates a draft summary automatically
	•	Based on episode‑level data already in scope

Physio Review
	•	Originating physio reviews summary before release
	•	Can annotate or clarify
	•	Cannot selectively remove unfavourable facts

This preserves accuracy while preventing cherry‑picking.

⸻

10. Release Mechanics

A summary is released only when:
	1.	A transition event occurs
	2.	The patient consents
	3.	The originating physio approves the summary

The receiving physio gains access only to the summary, not underlying notes.

⸻

11. Incentive Alignment

For Physios
	•	Sharing happens only when loss already exists
	•	No ambient exposure or browsing
	•	Summary improves downstream outcomes
	•	Participation reinforces referral trust

For Patients
	•	Less repetition
	•	Faster diagnosis
	•	Reduced wasted sessions

For the System
	•	Continuity improves signal quality
	•	Trust increases participation
	•	Shared history scales safely

⸻

12. Relationship to MVP

This extension depends on:
	•	High individual physio opt‑in
	•	Trust built via shadow mode
	•	Normalised consent flows
	•	Proven inbound referral value

Without the MVP, this extension would stall adoption.

⸻

13. Success Criteria

The extension is successful if:
	•	Physios perceive summaries as safe
	•	Patients consent without friction
	•	Receiving physios report improved continuity
	•	No drop‑off in opt‑in rates occurs

⸻

14. Risks and Mitigations

Risk: Perceived judgement
	•	Mitigation: No peer visibility, no rankings

Risk: Gaming through selective sharing
	•	Mitigation: Episode‑scoped, system‑generated summaries

Risk: Consent fatigue
	•	Mitigation: Trigger only at transitions

⸻

15. Summary

This extension completes the shared patient history story by:
	•	Making history explicit only when needed
	•	Preserving practitioner dignity
	•	Keeping incentives aligned
	•	Scaling beyond 19% adoption

Shared history emerges as a consequence of trust, not a prerequisite.
