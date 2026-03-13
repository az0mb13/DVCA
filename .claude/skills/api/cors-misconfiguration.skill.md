---
id: cors-misconfiguration
name: CORS Misconfiguration Testing
version: 1.0.0
domain: security
tags: [security, cors, browser, api, misconfiguration]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test Cross-Origin Resource Sharing policy for overly permissive origins, credential leakage, and unsafe wildcard handling.

## Detection Logic

1. Send requests with attacker-controlled `Origin` header.
2. Inspect `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`.
3. Confirm whether sensitive cross-origin reads are possible.

## Testing Playbook (curl + browser)

### curl
```bash
# Origin reflection test
curl -i https://target.tld/api/profile \
  -H "Origin: https://evil.tld" \
  -H "Cookie: session=$SESSION"

# Null origin test
curl -i https://target.tld/api/profile \
  -H "Origin: null" \
  -H "Cookie: session=$SESSION"
```

### Browser / agent-browser
1. From a different origin, execute `fetch()` against target API with credentials.
2. Observe if response is readable by attacker origin.
3. Confirm preflight and credentialed request behavior.

## Verification Criteria

- Vulnerable if arbitrary origin is allowed with credentials for sensitive data.
- Not vulnerable if explicit trusted origin allowlist is enforced.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

