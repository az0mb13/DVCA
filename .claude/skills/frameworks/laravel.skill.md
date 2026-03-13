---
id: framework-laravel
name: Laravel Security Patterns
version: 1.0.0
domain: frameworks
tags: [framework, laravel, security, authz, csrf]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit Laravel apps for middleware gaps, policy/guard misconfiguration, CSRF coverage, validation weaknesses, mass assignment, and debug leakage.

## Detection Logic

1. Verify auth middleware and policy/gate checks on sensitive routes.
2. Verify CSRF middleware on cookie-authenticated web routes.
3. Verify request validation and mass assignment controls (`$fillable` / `$guarded`).
4. Verify production-safe settings (`APP_DEBUG=false`, secure cookies).

## Testing Playbook (curl + browser)

### curl
```bash
# Access protected route without auth
curl -i https://target.tld/admin/users

# State-changing request without CSRF token
curl -i -X POST https://target.tld/profile/email \
  -H "Cookie: laravel_session=$SESSION" \
  -d "email=attacker@tld.com"

# IDOR check
curl -i -H "Authorization: Bearer $TOKEN_B" \
  https://target.tld/api/invoices/1001
```

### Browser / agent-browser
1. Test privileged actions as low-privilege user and verify deny behavior.
2. Replay web form submissions without/with stale CSRF token.
3. Check error pages and responses for debug stack trace leakage.

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "Route::(get|post|put|patch|delete)|middleware\(|can:|authorize\(" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "\$fillable|\$guarded|Validator::make|\$request->validate" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "APP_DEBUG\s*=\s*true|APP_ENV\s*=\s*local" .
```

## Verification Criteria

- Vulnerable if privileged routes lack guard/policy enforcement.
- Vulnerable if CSRF can be bypassed on session-authenticated actions.
- Vulnerable if mass assignment or debug leakage exposes sensitive behavior.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://laravel.com/docs/security
- https://cheatsheetseries.owasp.org/cheatsheets/Laravel_Cheat_Sheet.html
