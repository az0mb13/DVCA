---
id: csrf
name: Cross-Site Request Forgery Testing
version: 1.0.0
domain: security
tags: [security, csrf, browser, sessions]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test state-changing endpoints for CSRF protections. Validate anti-CSRF tokens, origin checks, and SameSite cookie behavior.

## Detection Logic

1. Identify state-changing routes (`POST`, `PUT`, `PATCH`, `DELETE`).
2. Send requests without CSRF tokens and with forged origins.
3. Confirm whether browser-authenticated action still succeeds.

## Testing Playbook (curl + browser)

### curl
```bash
# Attempt state change without CSRF token
curl -i -X POST https://target.tld/account/email \
  -H "Cookie: session=$SESSION" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "email=attacker@tld.com"

# Forge Origin/Referer (server-side validation check)
curl -i -X POST https://target.tld/account/password \
  -H "Cookie: session=$SESSION" \
  -H "Origin: https://evil.tld" \
  -H "Referer: https://evil.tld/poc" \
  --data "password=NewPass123!"
```

### Browser / agent-browser
1. Build a simple CSRF PoC form in a local HTML page.
2. Keep victim session logged in, open PoC page, auto-submit form.
3. Verify whether target state changes without explicit user consent.

## Verification Criteria

- Vulnerable if authenticated browser session can perform action without valid anti-CSRF control.
- Not vulnerable if token validation and origin policy reliably block forged requests.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/csrf
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/06-Session_Management_Testing/05-Testing_for_CSRF
- https://owasp.org/www-project-cheat-sheets/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

