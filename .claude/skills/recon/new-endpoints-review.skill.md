---
id: new-endpoints-review
name: New Endpoints Security Review
version: 1.1.0
domain: recon
tags: [recon, endpoints, api, diff-review, security]
tools_required: [rg, git]
agent_scope: [specialist/security, specialist/appsec]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Identify newly introduced API endpoints and review them for auth gaps, input validation issues, abuse risk, and dangerous data flows.

This skill is diff-driven and complements `recon/endpoint-crawl.skill.md`.
Use it when commit/PR history is available and the goal is change-focused review.

## Discovery Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "defineEventHandler|server/api|pages/api|app/api|router\\.(get|post|put|patch|delete)|app\\.(get|post|put|patch|delete)" .
git diff --name-only HEAD~1..HEAD | rg "server/api|api|routes|controllers|middleware"
git diff HEAD~1..HEAD | rg "defineEventHandler|router\\.|app\\.|readBody\\(|Authorization|auth|limit|schema|zod"
```

## Detection Logic

1. Enumerate newly added/changed routes and HTTP methods.
2. Check route-level authn/authz and whether endpoint is intentionally public.
3. Verify server-side validation for body/query/path values and operational bounds.
4. Check abuse controls (rate limits, quotas, recursion limits, payload size limits).
5. Trace untrusted input into sensitive sinks (DB query, command exec, outbound fetch, HTML rendering).

## Verification Criteria

- Vulnerable if privileged or cost-heavy endpoints are exposed without access controls.
- Vulnerable if new endpoints trust client-side validation only.
- Vulnerable if untrusted input reaches dangerous sinks without robust controls.

## False Positive Triage

1. Do not report public endpoints as auth bypass when they are intentionally public and low-impact.
2. Do not treat typed interfaces as validation; require runtime validation checks.
3. For “missing rate limit” findings, verify endpoint is abuse-prone (expensive or state-changing).
4. Confirm endpoint is newly introduced/changed before labeling as "new endpoint risk."
5. If commit history is unavailable, fall back to `recon/endpoint-crawl.skill.md` and do not claim "new endpoint" risk.

## Evidence Checklist

- Endpoint path, method, and changed files.
- Repro request examples and observed behavior.
- Preconditions (feature flags, deployment mode, auth state).
- Impact and suggested mitigation priority.

## References

- https://owasp.org/www-project-web-security-testing-guide/
- https://cheatsheetseries.owasp.org/
