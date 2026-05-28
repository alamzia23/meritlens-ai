# MeritLens Pitch

## One-liner

MeritLens is an AI performance-intelligence agent for enterprises that turns scattered employee signals into evidence-backed review drafts, coaching plans, and audit-ready manager decisions.

## Problem

Large companies spend massive time on performance reviews. The process is inconsistent, manager-dependent, difficult to audit, and vulnerable to recency bias. HR teams need leverage, but they cannot blindly automate people decisions.

## Solution

MeritLens automates the preparation layer of performance evaluation:

- Collect signals from goals, project systems, CRM, peer feedback, and manager notes.
- Extract evidence and map it to a company rubric.
- Detect bias, missing evidence, and prompt-injection attempts.
- Draft review feedback and coaching plans.
- Require human approval before decisions are finalized.

## Agentic Workflow

1. Ingestion Agent normalizes performance signals.
2. Evidence Agent links every claim to measurable proof.
3. Fairness Agent checks bias and inconsistent ratings.
4. Security Agent masks PII and blocks malicious text.
5. Review Agent drafts feedback and manager actions.

## Enterprise Value

- Saves review-prep time.
- Improves calibration consistency.
- Reduces unsupported feedback.
- Gives HR an audit trail.
- Keeps final accountability with humans.

## Demo Moment

Select Omar Williams and run the analysis. His self-review contains an instruction override attempt. MeritLens detects it, quarantines it, and prevents it from affecting the score.

## Technical Proof

The MVP now includes a local backend agent API, not only a static frontend. The backend reads synthetic enterprise data shaped like HRIS, Jira, GitHub, Salesforce, Slack, LMS, and privacy-review exports, then runs ingestion, evidence, fairness, security, and review agents before returning structured JSON to the UI.
