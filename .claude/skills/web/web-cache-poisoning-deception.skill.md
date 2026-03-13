---
id: web-cache-poisoning-deception
name: Web Cache Poisoning and Deception Testing
version: 1.0.0
domain: security
tags: [security, cache, poisoning, deception, cdn]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test cache key inconsistencies and cacheability mistakes that enable poisoning and web cache deception. Focus on shared cache layers and route normalization edge cases.

## Detection Logic

1. Discover cacheable endpoints and intermediary layers (`CDN`, reverse proxy).
2. Manipulate headers/query/path components that may affect origin behavior but not cache key.
3. Confirm victim-facing cache hits serving attacker-influenced or sensitive responses.

## Testing Playbook (curl + browser)

### curl
```bash
# Check cache indicators
curl -i https://target.tld/page

# Probe cache key with harmless header variation
curl -i https://target.tld/page -H "X-Forwarded-Host: attacker.tld"

# Probe deception-style path confusion
curl -i "https://target.tld/account/profile.css"
```

### Browser / agent-browser
1. Capture candidate pages with `Cache-Control`, `Age`, and cache debug headers.
2. Test key confusion inputs while preserving non-destructive payloads.
3. Verify poisoned/deceptive content can be reproduced from a separate session.

## Verification Criteria

- Vulnerable if attacker-controlled variants are stored and served to other users.
- Not vulnerable if cache keying and cache-control policy prevent cross-user contamination.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/web-security/web-cache-poisoning
- https://portswigger.net/web-security/web-cache-deception
- https://portswigger.net/kb/issues/00200180_web-cache-poisoning
- https://portswigger.net/kb/issues/00200650_web-cache-deception

