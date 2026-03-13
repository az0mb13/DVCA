---
id: jwt-api-token-security
name: JWT and API Token Security Testing
version: 1.0.0
domain: security
tags: [security, jwt, api, tokens, authorization]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test JWT and API token handling for signature validation flaws, claim misuse, token lifetime weaknesses, and broken revocation.

## Detection Logic

1. Inspect token structure and algorithm handling.
2. Verify server rejects tampered/expired/malformed tokens.
3. Verify authorization decisions are not based on untrusted claims only.

## Testing Playbook (curl + browser)

### curl
```bash
# Baseline authenticated call
curl -i -H "Authorization: Bearer $JWT" \
  https://target.tld/api/v1/me

# Tampered token (manually edit payload/signature before this step)
curl -i -H "Authorization: Bearer $TAMPERED_JWT" \
  https://target.tld/api/v1/me

# Expired token replay
curl -i -H "Authorization: Bearer $EXPIRED_JWT" \
  https://target.tld/api/v1/me
```

### Browser / agent-browser
1. Inspect storage location (cookie/localStorage/sessionStorage).
2. Logout and verify old access token is invalidated if revocation is expected.
3. Test role/tenant claim changes by replaying tampered token artifacts.

## Verification Criteria

- Vulnerable if modified or expired tokens are accepted.
- Vulnerable if role/tenant claims can be abused without server-side ownership checks.
- Not vulnerable if strict signature/algorithm validation and claim authorization are enforced.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-project-cheat-sheets/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html

