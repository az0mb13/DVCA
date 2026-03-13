---
id: business-logic-abuse
name: Business Logic Abuse Testing
version: 1.0.0
domain: security
tags: [security, business-logic, abuse, workflow]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/appsec]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test business workflows for abuse cases that bypass intended controls without classic technical vulnerabilities.

## Detection Logic

1. Map critical workflows (checkout, refunds, credits, role actions).
2. Identify trust assumptions and missing state validation.
3. Attempt sequence/order, concurrency, and replay abuse.

## Testing Playbook (curl + browser)

### curl
```bash
# Replay critical state-changing requests multiple times
curl -i -X POST https://target.tld/api/orders/123/refund \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: reused-key"
```

### Browser / agent-browser
1. Perform workflow out of expected order (skip step, repeat step, race step).
2. Use multiple tabs/sessions to trigger concurrent state transitions.
3. Verify server-side state machine prevents invalid transitions and duplicates.

## Verification Criteria

- Vulnerable if workflow can be abused for unauthorized value/state changes.
- Vulnerable if replay/race creates duplicate or inconsistent transactions.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-project-web-security-testing-guide/
