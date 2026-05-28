# Security Notes

This MVP is intentionally local and dependency-light for hackathon speed. The demo highlights enterprise controls that would matter in a production performance-review system.

## Implemented in the MVP

- No external network calls.
- No package dependencies or build pipeline.
- Prompt-injection scan for employee-entered text.
- PII minimization in generated evidence snippets.
- Audit log for profile views and analysis runs.
- Human approval language in the review flow.

## Production requirements

- SSO with enterprise identity providers.
- Tenant-isolated data stores and encryption at rest.
- Strict role-based access control for HR, managers, reviewers, and employees.
- Signed audit events and immutable retention policies.
- Structured model outputs validated against schemas.
- Separate policy engine for protected-class, compensation, and termination decisions.
- Red-team tests for prompt injection, data leakage, authorization bypass, and insecure direct object references.
