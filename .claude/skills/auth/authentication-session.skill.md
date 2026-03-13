---
id: authentication-session
name: Authentication and Session Management Testing
version: 1.0.0
domain: security
tags: [security, authentication, session, cookies, account-takeover]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/auth]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test login, logout, password reset, and session handling for weak controls (OWASP A07). Validate cookie flags, session invalidation, lockout, and MFA/step-up behavior.

## Detection Logic

1. Validate credential workflow (bruteforce controls, error handling).
2. Validate session lifecycle (rotation on login, invalidation on logout/reset).
3. Validate cookie security attributes and token exposure.
4. Validate MFA and recovery paths cannot bypass primary controls.

## Testing Playbook (curl + browser)

### curl
```bash
# Repeated login attempts (rate limiting and lockout behavior)
for i in {1..10}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://target.tld/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@tld.com","password":"WrongPass!"}'
done

# Inspect Set-Cookie flags (Secure, HttpOnly, SameSite)
curl -i -X POST https://target.tld/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tld.com","password":"CorrectPass!"}'
```

### Browser / agent-browser
1. Use Application/Storage tab to inspect cookies and token storage.
2. Logout, then replay an authenticated API request from Network tab.
3. Change password and confirm old session/token is rejected.
4. Attempt MFA recovery/reset abuse with stale tokens or reused links.

## Verification Criteria

- Vulnerable if session remains valid after logout/password reset.
- Vulnerable if session cookies lack `Secure` or `HttpOnly`, or unsafe `SameSite`.
- Vulnerable if login brute force is unthrottled and lockout/step-up absent.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/04-Authentication_Testing/
- https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html
- https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html

