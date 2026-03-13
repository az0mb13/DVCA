---
id: http-header-injection
name: HTTP and SMTP Header Injection Testing
version: 1.0.0
domain: security
tags: [security, header-injection, crlf, smtp, response-splitting]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test untrusted input that reaches HTTP or SMTP headers without proper newline handling. Focus on CRLF injection, response splitting, and email header abuse.

## Detection Logic

1. Identify parameters reflected into redirects, filenames, cookies, and mail fields.
2. Inject encoded CRLF sequences (`%0d%0a`) and additional header fragments.
3. Verify whether response/mail headers are modified or split.

## Testing Playbook (curl + browser)

### curl
```bash
# HTTP header injection probe
curl -i "https://target.tld/redirect?next=%0d%0aX-Injected:%20yes"

# SMTP header injection probe (example contact form backend)
curl -i -X POST https://target.tld/contact \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "email=victim@tld.com%0d%0aBcc:%20attacker@tld.com&message=test"
```

### Browser / agent-browser
1. Test redirect/search/download/contact features that emit dynamic headers.
2. Replay requests with encoded CRLF payloads in header-influencing fields.
3. Confirm additional headers or mail recipients are injected.

## Verification Criteria

- Vulnerable if untrusted input injects or alters protocol headers.
- Not vulnerable if newline/control characters are blocked or safely encoded.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/kb/issues/00200200_http-response-header-injection
- https://portswigger.net/kb/issues/00200800_smtp-header-injection

