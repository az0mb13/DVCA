---
id: http-methods-misconfiguration
name: Dangerous HTTP Methods Testing
version: 1.0.0
domain: security
tags: [security, http-methods, put, trace, misconfiguration]
tools_required: [curl]
agent_scope: [specialist/security, specialist/web]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test server exposure of risky methods such as `PUT` and `TRACE`, especially where write or debugging behavior is unintentionally enabled in production.

## Detection Logic

1. Enumerate allowed methods per sensitive route using `OPTIONS`.
2. Probe `PUT`/`TRACE` behavior on web roots and static paths.
3. Confirm whether request content is stored, echoed, or otherwise mishandled.

## Testing Playbook (curl)

### curl
```bash
# Enumerate supported methods
curl -i -X OPTIONS https://target.tld/

# Probe TRACE echo behavior
curl -i -X TRACE https://target.tld/ -H "X-Test: trace-probe"

# Probe PUT upload behavior (safe test path)
curl -i -X PUT https://target.tld/uploads/probe.txt --data "probe"
```

## Verification Criteria

- Vulnerable if unsafe methods are enabled with exploitable behavior.
- Not vulnerable if unnecessary methods are disabled or strictly access-controlled.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/kb/issues/00100900_http-put-method-is-enabled
- https://portswigger.net/kb/issues/00500a00_http-trace-method-is-enabled

