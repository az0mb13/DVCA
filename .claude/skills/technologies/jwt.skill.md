---
id: tech-jwt
name: JWT Security Patterns
version: 1.0.0
domain: technologies
tags: [technology, jwt, security, tokens]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/auth]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test JWT authentication and authorization for signature validation flaws, algorithm confusion, claim misuse, token lifetime weaknesses, and revocation gaps.

## Detection Logic

1. Verify signature and algorithm enforcement.
2. Verify expiry, not-before, issuer, and audience validation.
3. Verify role/tenant claims are not trusted without server-side ownership checks.
4. Verify revocation and logout invalidation behavior.

## Detection Steps

1. Collect baseline valid token and protected endpoint behavior.
2. Replay tampered, expired, malformed, and cross-tenant tokens.
3. Validate token storage and transport controls.

## Payloads

- Tampered payload (`role: admin`) with unchanged signature.
- Expired token replay.
- Wrong `aud`/`iss` token replay.

## Testing Playbook (curl + browser)

### curl
```bash
# Baseline
curl -i -H "Authorization: Bearer $JWT" https://target.tld/api/me

# Tampered token
curl -i -H "Authorization: Bearer $TAMPERED_JWT" https://target.tld/api/me

# Expired token
curl -i -H "Authorization: Bearer $EXPIRED_JWT" https://target.tld/api/me
```

### Browser / agent-browser
1. Inspect token storage (`HttpOnly` cookie preferred over JS-readable storage).
2. Logout and retry previous token to verify revocation behavior.
3. Check sensitive actions use server-side authorization, not claim-only trust.

## Verification Criteria

- Vulnerable if modified or expired tokens are accepted.
- Vulnerable if claim tampering enables privilege or tenant escalation.
- Vulnerable if logout/revocation leaves old tokens active.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
