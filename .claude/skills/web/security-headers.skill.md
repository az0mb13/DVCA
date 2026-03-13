---
id: security-headers
name: HTTP Security Headers Audit
version: 1.0.0
domain: security
tags: [security, headers, csp, hsts, clickjacking]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit response headers that reduce exploitability in browsers: `CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and cookie flags.

## Detection Logic

1. Capture headers from authenticated and unauthenticated routes.
2. Compare against baseline policy requirements.
3. Validate headers are effective and not contradictory.

## Testing Playbook (curl + browser)

### curl
```bash
# Main page headers
curl -I https://target.tld/

# Authenticated page headers
curl -I -H "Cookie: session=$SESSION" https://target.tld/dashboard

# Check redirect chain for HSTS presence
curl -I -L https://target.tld/
```

### Browser / agent-browser
1. Open DevTools Security/Network panel and inspect headers.
2. Check CSP console violations and inline script blocking behavior.
3. Test clickjacking resistance with a simple iframe wrapper page.

## Verification Criteria

- Vulnerable if key headers are missing or weak (for example, permissive CSP such as `unsafe-inline` everywhere).
- Not vulnerable if policy is present, enforced, and aligned across sensitive routes.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- https://owasp.org/www-project-secure-headers/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security

