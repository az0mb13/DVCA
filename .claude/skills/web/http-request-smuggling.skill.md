---
id: http-request-smuggling
name: HTTP Request Smuggling and Desync Testing
version: 1.0.0
domain: security
tags: [security, request-smuggling, desync, http1, reverse-proxy]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test front-end and back-end HTTP parser disagreements that allow request boundary confusion. Include classic TE/CL smuggling and client-side desync patterns.

## Detection Logic

1. Identify proxy chains (CDN/WAF/load balancer + origin app).
2. Send conflicting `Content-Length` and `Transfer-Encoding` requests safely.
3. Confirm downstream desynchronization via timing, response mix-up, or poisoning indicators.

## Testing Playbook (curl + browser)

### curl
```bash
# Baseline: verify target supports keep-alive and chunked behavior
curl -i https://target.tld/

# Manual crafted smuggling payloads should be executed through specialized tooling
# (for example Burp Repeater/HTTP Request Smuggler) in controlled environments.
```

### Browser / agent-browser
1. Use browser traffic to capture realistic request patterns and cookies.
2. Replay candidate requests through proxy tooling with CL.TE / TE.CL variants.
3. Verify queue poisoning, response queue desync, or credential impact.

## Verification Criteria

- Vulnerable if parser disagreement enables request boundary confusion with measurable impact.
- Not vulnerable if malformed/ambiguous requests are normalized or rejected consistently.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/web-security/request-smuggling
- https://portswigger.net/kb/issues/00200140_http-request-smuggling
- https://portswigger.net/kb/issues/00200141_client-side-desync

