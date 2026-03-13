---
id: xxe
name: XML External Entity (XXE) Testing
version: 1.0.0
domain: security
tags: [security, xxe, xml, parser, ssrf]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: medium
source: internal
created_at: 2026-03-09
---

## Overview

Test XML parsers for unsafe external entity resolution that can lead to file disclosure, SSRF, and denial of service.

## Detection Logic

1. Identify XML-consuming endpoints (`application/xml`, SOAP, SAML).
2. Submit XML with external entities.
3. Confirm file retrieval or outbound request behavior.

## Testing Playbook (curl + browser)

### curl
```bash
curl -i -X POST https://target.tld/api/xml \
  -H "Content-Type: application/xml" \
  --data '<?xml version="1.0"?>
<!DOCTYPE root [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<root><name>&xxe;</name></root>'
```

### Browser / agent-browser
1. Use any UI import feature that accepts XML content.
2. Replay request with XXE payload via DevTools.
3. Check response and logs for injected entity expansion effects.

## Verification Criteria

- Vulnerable if external entity content appears in output or triggers internal fetch.
- Not vulnerable if DTD/external entities are disabled and parser is hardened.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing
- https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/

