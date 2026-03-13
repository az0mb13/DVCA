---
id: tech-oauth2
name: OAuth2 Security Patterns
version: 1.0.0
domain: technologies
tags: [technology, oauth2, security, oidc]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/auth]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test OAuth2/OIDC flows for redirect URI misuse, state/PKCE weaknesses, token leakage, and client misconfiguration.

## Detection Logic

1. Verify authorization code flow uses strict redirect URI matching.
2. Verify `state` and PKCE are required and validated.
3. Verify tokens are not exposed in URLs, logs, or insecure storage.
4. Verify scope and consent enforcement.

## Detection Steps

1. Capture login flow endpoints (`/authorize`, `/token`, callback URI).
2. Attempt redirect URI manipulation and state replay.
3. Attempt code replay and verifier mismatch.
4. Validate scope minimization and consent behavior.

## Payloads

- `redirect_uri=https://evil.tld/cb`
- Reused/stale `state` value.
- Missing/incorrect PKCE `code_verifier`.

## Testing Playbook (curl + browser)

### curl
```bash
# Token request with attacker redirect URI (should fail)
curl -i -X POST https://target.tld/oauth/token \
  -d "grant_type=authorization_code&code=$CODE&client_id=$CLIENT_ID&redirect_uri=https://evil.tld/cb"
```

### Browser / agent-browser
1. Start auth flow and tamper callback params (`state`, `code`, `redirect_uri`).
2. Verify mismatch or replay is rejected.
3. Confirm PKCE mandatory for public clients.
4. Verify scopes requested align with least privilege.

## Verification Criteria

- Vulnerable if redirect URI validation is loose (prefix/wildcard abuse).
- Vulnerable if `state`/PKCE checks are missing or bypassable.
- Vulnerable if tokens leak in query strings, referrers, or client logs.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://datatracker.ietf.org/doc/html/rfc6749
- https://datatracker.ietf.org/doc/html/rfc7636
- https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
