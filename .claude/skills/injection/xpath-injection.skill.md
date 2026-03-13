---
id: xpath-injection
name: XPath Injection Testing
version: 1.0.0
domain: security
tags: [security, xpath, injection, xml, auth]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test XML/XPath query builders where user input is interpolated into XPath expressions. Focus on auth bypass and record disclosure through query manipulation.

## Detection Logic

1. Find endpoints using XML user stores, SAML helper logic, or XML-backed search.
2. Inject quote-breaking and boolean XPath payloads.
3. Observe result count/auth behavior changes and error signals.

## Testing Playbook (curl + browser)

### curl
```bash
# Auth bypass style probe
curl -i -X POST https://target.tld/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=admin' or '1'='1&password=x"

# Enumeration-style probe
curl -i "https://target.tld/api/users?name=' or contains(name,'a') or '1'='1"
```

### Browser / agent-browser
1. Test login/search forms suspected to use XML/XPath data stores.
2. Replay requests with quote and predicate payloads.
3. Confirm whether unauthorized records are returned or login controls fail open.

## Verification Criteria

- Vulnerable if payload alters XPath predicate semantics and changes access/results.
- Not vulnerable if expression parameters are safely handled and behavior is stable.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://owasp.org/www-community/attacks/XPATH_Injection
- https://portswigger.net/kb/issues/00100600_xpath-injection

