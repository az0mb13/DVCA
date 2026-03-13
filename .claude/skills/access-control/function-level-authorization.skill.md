---
id: function-level-authorization
name: Function-Level Authorization Testing
version: 1.0.0
domain: security
tags: [security, access-control, bfla, privilege-escalation]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test privileged actions and admin functions for missing role/permission checks (BFLA).

## Detection Logic

1. Identify role-gated endpoints and UI actions.
2. Replay privileged calls with low-privilege users.
3. Confirm deny behavior on every sensitive action.

## Testing Playbook (curl + browser)

### curl
```bash
# Low-privilege attempt on admin action
curl -i -X POST https://target.tld/api/admin/users/42/disable \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Browser / agent-browser
1. Capture admin action requests from privileged account.
2. Replay same requests from low-privileged account/session.
3. Validate both API and UI enforcement paths.

## Verification Criteria

- Vulnerable if low-privilege user can invoke privileged functions.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/
