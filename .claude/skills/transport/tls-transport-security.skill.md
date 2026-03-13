---
id: tls-transport-security
name: TLS and Transport Security Testing
version: 1.0.0
domain: security
tags: [security, tls, transport, hsts]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Validate HTTPS enforcement, TLS configuration hygiene, certificate handling, and mixed-content exposure.

## Detection Logic

1. Confirm HTTP to HTTPS redirect behavior.
2. Confirm HSTS and secure cookie enforcement.
3. Confirm no mixed content on authenticated pages.

## Testing Playbook (curl + browser)

### curl
```bash
# HTTP redirect behavior
curl -I http://target.tld/

# HSTS and secure headers
curl -I https://target.tld/
```

### Browser / agent-browser
1. Open app over HTTPS and check Security panel for cert issues.
2. Verify mixed-content warnings are absent.
3. Validate secure cookies are not sent over HTTP.

## Verification Criteria

- Vulnerable if HTTP remains usable for sensitive flows.
- Vulnerable if HSTS is missing and downgrade risk exists.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
