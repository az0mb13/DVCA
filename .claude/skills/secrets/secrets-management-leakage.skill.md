---
id: secrets-management-leakage
name: Secrets Management and Leakage Testing
version: 1.1.0
domain: security
tags: [security, secrets, credentials, leakage]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/devsecops]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Detect leaked API keys, tokens, private keys, and credentials in source, logs, responses, and client bundles.

Use this as the broad secrets workflow (code + runtime exposure + incident response checks).
For a fast repo-only static scan, use `secrets/hardcoded-api-keys.skill.md`.

## Detection Logic

1. Scan repositories and configs for high-entropy secret patterns.
2. Check runtime responses and JS bundles for accidental secret exposure.
3. Validate key rotation and revocation process.

## Testing Playbook (curl + browser)

### curl
```bash
# Check debug/metadata-style endpoints for secret leakage
curl -i https://target.tld/.env
curl -i https://target.tld/config.json
curl -i https://target.tld/api/status
```

### Browser / agent-browser
1. Inspect client bundles and source maps for embedded secrets.
2. Review network responses for tokens, internal keys, or stack traces.
3. Verify exposed secrets are invalidated/rotated immediately.

## Verification Criteria

- Vulnerable if valid secrets are exposed in client assets, responses, logs, or repo files.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
