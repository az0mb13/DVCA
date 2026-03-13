---
id: framework-express
name: Express Security Patterns
version: 1.0.0
domain: frameworks
tags: [framework, express, security, auth, headers]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit Express apps for common security mistakes: missing authz middleware, weak session/cookie config, unsafe input handling, and missing hardening middleware.

## Detection Logic

1. Verify admin and object routes are protected by authn/authz middleware.
2. Verify secure session and cookie settings.
3. Verify input validation/sanitization for query/body/params.
4. Verify hardening middleware (`helmet`, rate limiting, CORS) behavior.

## Testing Playbook (curl + browser)

### curl
```bash
# Unauthorized route access
curl -i https://target.tld/api/admin/stats

# IDOR-style object access with another user's token
curl -i -H "Authorization: Bearer $TOKEN_B" \
  https://target.tld/api/orders/1001

# Header and cookie policy check
curl -i -X POST https://target.tld/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tld.com","password":"pass"}'
```

### Browser / agent-browser
1. Login as separate users in separate profiles and replay API requests.
2. Verify unauthorized access is blocked with `401/403`.
3. Inspect cookies (`Secure`, `HttpOnly`, `SameSite`) and response headers.

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "app\\.(get|post|put|patch|delete)\\(|router\\.(get|post|put|patch|delete)\\(" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "helmet|cors|express-rate-limit|cookie-session|express-session" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "eval\\(|exec\\(|spawn\\(|child_process" .
```

## Verification Criteria

- Vulnerable if protected routes can be used without proper authorization checks.
- Vulnerable if session/cookie settings are weak or missing.
- Vulnerable if input reaches dangerous sinks without validation.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://expressjs.com/en/advanced/best-practice-security.html
- https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
