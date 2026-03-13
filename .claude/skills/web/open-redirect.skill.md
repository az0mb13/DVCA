---
id: open-redirect
name: Open Redirect Testing
version: 1.0.0
domain: security
tags: [security, open-redirect, phishing, oauth]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: medium
source: internal
created_at: 2026-03-09
---

## Overview

Test redirect endpoints and auth flows (`next`, `returnTo`, `redirect_uri`) for external redirect abuse.

## Detection Logic

1. Locate parameters that control redirect targets.
2. Inject absolute URLs and encoded variants.
3. Validate whether user is redirected to attacker-controlled domain.

## Testing Playbook (curl + browser)

### curl
```bash
# Direct open redirect probe
curl -i "https://target.tld/login?next=https://evil.tld"

# Encoded and protocol-relative variants
curl -i "https://target.tld/redirect?url=%2F%2Fevil.tld"
curl -i "https://target.tld/redirect?url=https:%2F%2Fevil.tld"
```

### Browser / agent-browser
1. Trigger login/logout/password-reset flows with manipulated return URL params.
2. Observe final navigation target and address bar domain.
3. Validate OAuth redirect URI checks are strict and exact-match.

## Verification Criteria

- Vulnerable if arbitrary external URL redirection is possible from trusted domain.
- Not vulnerable if redirect destination is allowlisted or strictly relative/safe.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/Unvalidated_Redirects_and_Forwards_Cheat_Sheet
- https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html

