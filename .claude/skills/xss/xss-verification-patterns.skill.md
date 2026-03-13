---
id: xss-verification-patterns
name: XSS Verification and Evidence Patterns
version: 1.0.0
domain: xss
tags: [xss, verification, evidence, secure-testing]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/xss, specialist/security-testing]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Find and validate XSS issues by proving exploitability safely, documenting impact, and generating reproducible evidence.

## Detection Logic

1. Identify source-to-sink path in code and runtime behavior.
2. Test context-specific payloads (HTML, attribute, URL, JS context).
3. Verify execution or policy bypass without destructive actions.
4. Record evidence with request/response and rendered DOM proof.

## Testing Playbook (curl + browser)

### curl
```bash
# Reflected input check
curl -i "https://target.tld/search?q=%3Csvg%20onload%3Dalert(1)%3E"

# Stored-input API check
curl -i -X POST https://target.tld/api/comments \
  -H "Content-Type: application/json" \
  -d '{"text":"<img src=x onerror=alert(1)>"}'
```

### Browser / agent-browser
1. Reproduce reflected/stored input in affected UI path.
2. Confirm whether payload executes in victim browser context.
3. Capture DevTools evidence: request, response, rendered DOM, and console/security signals.
4. Verify scope: single page, shared component, or cross-user stored impact.

## Verification Criteria

- Confirm issue only when untrusted input reaches executable browser context.
- Confirm reproducibility across fresh session/profile.
- Confirm impact type: reflected, stored, or DOM-based XSS.

## Evidence Checklist

- Capture exact payload, endpoint, and affected parameter/field.
- Capture execution proof (DOM/console/network) with timestamps.
- Capture privilege and blast radius (self-only, any user, admin view).

## References

- https://owasp.org/Top10/2021/A03_2021-Injection/
- https://owasp.org/www-community/attacks/xss/
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Client-side_Testing/
