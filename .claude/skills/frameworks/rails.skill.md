---
id: framework-rails
name: Rails Security Patterns
version: 1.0.0
domain: frameworks
tags: [framework, rails, security, csrf, authz]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit Rails apps for controller authorization gaps, CSRF coverage, unsafe rendering, mass assignment issues, and session security.

## Detection Logic

1. Verify authorization checks in controllers and policies.
2. Verify CSRF protection for non-API browser endpoints.
3. Verify strong parameters and model assignment controls.
4. Verify unsafe rendering (`html_safe`, `raw`) is not fed untrusted input.

## Testing Playbook (curl + browser)

### curl
```bash
# Authz check on admin endpoint
curl -i https://target.tld/admin/users

# CSRF check for browser endpoint
curl -i -X POST https://target.tld/account/email \
  -H "Cookie: _session=$SESSION" \
  -d "email=attacker@tld.com"

# IDOR check
curl -i -H "Cookie: _session=$SESSION_B" \
  https://target.tld/orders/1001
```

### Browser / agent-browser
1. Replay requests from privileged UI actions as low-privilege session.
2. Verify destructive actions require valid CSRF token.
3. Inspect pages for reflected/stored unescaped user content.

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "before_action|authorize|policy_scope|Pundit|CanCan" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "permit\(|require\(|update\(|assign_attributes\(" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "html_safe|raw\(|sanitize\(" .
```

## Verification Criteria

- Vulnerable if controller actions miss authorization checks.
- Vulnerable if CSRF checks are bypassable on cookie-authenticated flows.
- Vulnerable if untrusted content is rendered without proper escaping.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://guides.rubyonrails.org/security.html
- https://cheatsheetseries.owasp.org/cheatsheets/Ruby_on_Rails_Cheat_Sheet.html
