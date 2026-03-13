---
id: rate-limiting-abuse
name: Rate Limiting and Abuse Control Testing
version: 1.0.0
domain: security
tags: [security, rate-limit, bruteforce, abuse, dos]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/auth]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test anti-automation controls on login, OTP, password reset, and high-cost endpoints. Validate per-user and per-IP throttling behavior.

## Detection Logic

1. Identify abuse-prone endpoints.
2. Send burst traffic and distributed-pattern traffic.
3. Confirm progressive delay, lockout, CAPTCHA, or quota enforcement.

## Testing Playbook (curl + browser)

### curl
```bash
# Burst requests to login endpoint
for i in {1..30}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://target.tld/api/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user@tld.com\",\"password\":\"wrong$i\"}"
done

# Check retry headers if present
curl -i -X POST https://target.tld/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tld.com","password":"wrong"}'
```

### Browser / agent-browser
1. Repeat sensitive actions rapidly in UI (login/OTP/reset/search).
2. Observe UI and network responses for throttling and cooldown windows.
3. Validate controls are consistent across API and web frontend.

## Verification Criteria

- Vulnerable if unlimited attempts are possible without meaningful friction.
- Not vulnerable if threshold-based throttling and abuse controls trigger reliably.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/
- https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html

