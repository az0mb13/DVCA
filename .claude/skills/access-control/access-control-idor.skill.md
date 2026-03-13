---
id: access-control-idor
name: Broken Access Control and IDOR Testing
version: 1.0.0
domain: security
tags: [security, access-control, idor, authorization, api]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test for missing object-level and function-level authorization checks (OWASP A01). Focus on IDOR/BOLA by changing object identifiers across users and roles.

## Detection Logic

1. Capture a baseline request as User A (e.g., `/api/orders/1001`).
2. Replay with User B credentials while keeping User A object IDs.
3. Change role-only actions (admin endpoints, privileged flags).
4. Flag a finding when cross-tenant/object access returns `200` with sensitive data or allows state change.

## Testing Playbook (curl + browser)

### curl
```bash
# User A fetches own resource
curl -i -H "Authorization: Bearer $TOKEN_A" \
  https://target.tld/api/v1/invoices/1001

# User B tries User A object (IDOR/BOLA)
curl -i -H "Authorization: Bearer $TOKEN_B" \
  https://target.tld/api/v1/invoices/1001

# Privilege escalation check on role-protected action
curl -i -X POST -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' https://target.tld/api/v1/users/42/role
```

### Browser / agent-browser
1. Login as User A and User B in separate browser profiles.
2. In DevTools Network tab, copy API requests from User A.
3. Replay request as User B (Edit and Resend / fetch in console).
4. Confirm whether unauthorized reads/writes are accepted.

## Verification Criteria

- Vulnerable if unauthorized user can read, modify, delete, or invoke privileged action on another object.
- Not vulnerable if request is denied (`401/403`) and object existence is not leaked.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References

