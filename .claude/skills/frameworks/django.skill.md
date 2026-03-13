---
id: framework-django
name: Django Security Patterns
version: 1.0.0
domain: frameworks
tags: [framework, django, security, csrf, authz]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit Django apps for framework-level security controls: CSRF middleware, authz checks, safe ORM usage, secure settings, and admin surface protection.

## Detection Logic

1. Verify view-level permissions (`@login_required`, custom object checks).
2. Verify CSRF enforcement for state-changing requests.
3. Verify production settings (`DEBUG=False`, secure cookies, `ALLOWED_HOSTS`).
4. Verify raw SQL usage and unsafe template marking.

## Testing Playbook (curl + browser)

### curl
```bash
# State-changing request without CSRF token
curl -i -X POST https://target.tld/profile/email \
  -H "Cookie: sessionid=$SESSION" \
  -d "email=attacker@tld.com"

# IDOR-style object access
curl -i -H "Cookie: sessionid=$SESSION_B" \
  https://target.tld/api/invoices/1001

# Header and cookie check
curl -I https://target.tld/
```

### Browser / agent-browser
1. Submit forms with and without valid CSRF token in authenticated session.
2. Replay API calls from another user context and verify object-level deny.
3. Inspect admin endpoints and confirm unauthorized access blocking.

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "@login_required|permission_required|has_perm|has_object_permission" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "raw\\(|RawSQL|extra\\(|mark_safe\\(|safe" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "DEBUG\s*=\s*True|ALLOWED_HOSTS\s*=\s*\[\]|CSRF_TRUSTED_ORIGINS\s*=\s*\[\]" .
```

## Verification Criteria

- Vulnerable if CSRF protections can be bypassed on state-changing routes.
- Vulnerable if user B can access user A objects.
- Vulnerable if production-critical security settings are unsafe.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://docs.djangoproject.com/en/stable/topics/security/
- https://cheatsheetseries.owasp.org/cheatsheets/Django_Security_Cheat_Sheet.html
