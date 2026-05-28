# MeritLens MVP

MeritLens is a hackathon-ready MVP for enterprise employee performance analysis. It helps HR and managers analyze performance evidence, identify risks, draft review language, and preserve human approval.

## Why it can win

- Clear enterprise buyer: large companies with thousands of performance reviews each cycle.
- Agentic workflow: ingestion, evidence, fairness, security, and review agents collaborate in sequence.
- Human-in-the-loop: the product assists managers; it does not auto-fire, auto-promote, or auto-set compensation.
- Security posture: prompt-injection detection, PII minimization, audit log, and evidence-only generation are visible in the demo.
- Codex usage: this repo was scaffolded and implemented as a working local MVP inside Codex.

## Demo flow

1. Open the app.
2. Select an employee profile from the queue.
3. Click **Run Agent Analysis**.
4. Show the five agent stages lighting up.
5. Open **Evidence**, **Review Draft**, **Coaching**, and **Security** tabs.
6. Select Omar Williams to demonstrate prompt-injection quarantine.

## Local run

```bash
npm start
```

Then open `http://localhost:5173`.

For a quick static-only demo, `python3 -m http.server 5173` still works, but the full MVP uses `npm start` so the frontend can call the backend agent API.

## Backend API

- `GET /api/health` checks the local service.
- `GET /api/employees` returns review-safe employee summaries.
- `GET /api/analyze/:employeeId` runs the synthetic enterprise performance agent pipeline.

The backend uses local synthetic data in `data/employees.json` and does not require external API keys. This keeps the hackathon demo reliable while still showing a real agentic workflow.

## What this MVP proves

- Performance analysis can be grounded in evidence rather than memory or biased narrative.
- HR teams can automate a major chunk of review preparation while keeping final decisions with humans.
- Enterprise buyers get consistency, auditability, and security controls.

## Next build steps

- Connect real HRIS, Jira, GitHub, Salesforce, Slack, and LMS data sources through permissioned integrations.
- Replace demo scoring with configurable company calibration rubrics.
- Add tenant isolation, SSO, encrypted storage, and granular role-based access control.
- Use an OpenAI model for grounded review drafting with structured JSON outputs and policy checks.
