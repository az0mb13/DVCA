---
id: logging-monitoring-alerting
name: Security Logging, Monitoring, and Alerting Testing
version: 1.0.0
domain: security
tags: [security, logging, monitoring, detection]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/detection]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Validate that critical security events are logged, correlated, and alerted without leaking sensitive data.

## Detection Logic

1. Trigger key events: auth failures, privilege changes, token misuse.
2. Verify event integrity, context, and alert routing.
3. Verify sensitive data redaction in logs.

## Testing Playbook (curl + browser)

### curl
```bash
# Trigger login failures
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://target.tld/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@tld.com","password":"wrong"}'
done
```

### Browser / agent-browser
1. Trigger account security events (password reset, role changes).
2. Verify SOC-relevant events are searchable and alerted.
3. Check logs avoid raw secrets, tokens, and PII leakage.

## Verification Criteria

- Vulnerable if critical events are missing, unactionable, or silently dropped.
- Vulnerable if logs leak credentials/tokens.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/Top10/2021/A09_2021-Security_Logging_and_Monitoring_Failures/
