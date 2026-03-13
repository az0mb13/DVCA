---
id: endpoint-crawl
name: Endpoint Crawling
version: 1.1.0
domain: recon
tags: [recon, crawl, attack-surface]
tools_required: [curl, agent-browser, rg]
agent_scope: [intake/fingerprint, specialist/security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Map the full attack surface before vulnerability testing. Discover web routes, API endpoints, static assets, hidden paths, parameters, and auth boundaries.

Use this for full-surface runtime discovery.
For security review of endpoints introduced by recent code changes, use `recon/new-endpoints-review.skill.md`.

## Detection Logic

1. Enumerate publicly reachable pages and linked resources.
2. Extract API paths from JS bundles and network traces.
3. Classify routes by auth requirement and sensitivity.
4. Prioritize endpoints by risk (state-changing, admin, file, callback, fetch URL).

## Detection Steps

1. Start from root pages and known product routes.
2. Collect `robots.txt`, `sitemap.xml`, JS bundle references.
3. Record all endpoints observed in browser network panel.
4. Build deduplicated endpoint list with method + auth + notes.

## Payloads

- Discovery probes only (no destructive payloads at recon stage).
- Parameter mutation candidates for follow-up testing.

## Testing Playbook (curl + browser)

### curl
```bash
curl -i https://target.tld/
curl -i https://target.tld/robots.txt
curl -i https://target.tld/sitemap.xml
curl -i https://target.tld/.well-known/security.txt
```

### Browser / agent-browser
1. Browse all main user journeys and capture all XHR/fetch/WebSocket calls.
2. Extract route paths from downloaded JS bundles.
3. Replay discovered endpoints to validate status/auth behavior.
4. Label endpoints for follow-up skills (authz, injection, SSRF, uploads).

## Verification Criteria

- Recon is complete when all user-facing and API flows are mapped with methods and auth context.
- Incomplete if only static path brute force is performed without runtime network capture.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-project-web-security-testing-guide/
- https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.html
