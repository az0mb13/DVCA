---
id: host-header-request-url-override
name: Host Header and Request URL Override Testing
version: 1.0.0
domain: security
tags: [security, host-header, routing, url-override, cache]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test trust boundaries around `Host` and URL override headers that influence routing, link generation, password reset URLs, or cache keys.

## Detection Logic

1. Find endpoints generating absolute links, redirects, and tenant routing decisions.
2. Inject alternate host and URL override headers.
3. Confirm whether server behavior trusts attacker-supplied upstream metadata.

## Testing Playbook (curl + browser)

### curl
```bash
# Host header probe
curl -i https://target.tld/reset \
  -H "Host: attacker.tld"

# URL override style probe
curl -i https://target.tld/ \
  -H "X-Forwarded-Host: attacker.tld" \
  -H "X-Original-URL: /admin"
```

### Browser / agent-browser
1. Trigger email/reset/invite flows that embed absolute URLs.
2. Replay requests with alternate forwarding headers.
3. Validate whether generated links or routing decisions are attacker-controlled.

## Verification Criteria

- Vulnerable if upstream header trust causes security-sensitive URL/routing manipulation.
- Not vulnerable if trusted proxy handling and host validation are enforced.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/kb/issues/00400f00_request-url-override
- https://portswigger.net/web-security/host-header

