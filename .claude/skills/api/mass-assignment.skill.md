---
id: api-mass-assignment
name: API Mass Assignment Testing
version: 1.0.0
domain: security
tags: [security, api, mass-assignment, authorization]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test whether API accepts unauthorized object fields during create/update operations (for example `isAdmin`, `role`, `tenantId`, `balance`).

## Detection Logic

1. Capture normal create/update payload.
2. Inject sensitive fields not present in UI.
3. Confirm server ignores/rejects protected fields.

## Testing Playbook (curl + browser)

### curl
```bash
curl -i -X PATCH https://target.tld/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"alice","role":"admin","isAdmin":true}'
```

### Browser / agent-browser
1. Intercept profile/account update request from UI.
2. Add hidden privileged fields and replay.
3. Verify persisted object does not reflect unauthorized fields.

## Verification Criteria

- Vulnerable if unauthorized writable fields are accepted and persisted.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/
- https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/
