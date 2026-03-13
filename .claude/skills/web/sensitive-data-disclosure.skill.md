---
id: sensitive-data-disclosure
name: Sensitive Data Disclosure Testing
version: 1.0.0
domain: security
tags: [security, disclosure, pii, secrets, jwks, backups]
tools_required: [curl, rg, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test responses and exposed files for sensitive data leakage including credentials, private keys, personal data, backups, source, and API definitions.

## Detection Logic

1. Crawl predictable discovery paths (`/.git`, backups, `openapi`, `jwks`, directory listing targets).
2. Inspect responses for sensitive patterns (tokens, keys, PII, secrets in query strings).
3. Validate whether leaked data is actionable and accessible without elevated privileges.

## Testing Playbook (curl + browser + rg)

### curl
```bash
# Common disclosure endpoints
curl -i https://target.tld/robots.txt
curl -i https://target.tld/.well-known/jwks.json
curl -i https://target.tld/openapi.json
curl -i https://target.tld/backup.zip

# Query-string secret leakage probe
curl -i "https://target.tld/login?password=test"
```

### Browser / agent-browser
1. Review developer/debug endpoints and downloadable files.
2. Inspect URL parameters, page source, and API responses for sensitive values.
3. Confirm exposure from low-privilege or unauthenticated contexts.

### Static scan (`rg`)
```bash
# Sensitive pattern hunting in captured artifacts
rg "BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|AKIA[0-9A-Z]{16}|password=|api[_-]?key|secret" -n .
```

## Verification Criteria

- Vulnerable if sensitive information is exposed beyond intended trust boundaries.
- Not vulnerable if sensitive artifacts are unavailable or properly redacted.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/kb/issues/006000b0_source-code-disclosure
- https://portswigger.net/kb/issues/006000d8_backup-file
- https://portswigger.net/kb/issues/00600700_json-web-key-set-disclosed
- https://portswigger.net/kb/issues/00600900_openapi-definition-found-active-scan-check

