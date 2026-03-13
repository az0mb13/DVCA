---
id: ldap-injection
name: LDAP Injection Testing
version: 1.0.0
domain: security
tags: [security, ldap, injection, auth, directory-services]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test authentication and directory lookup flows that construct LDAP filters from user input. Focus on filter bypass and wildcard abuse that can alter query intent.

## Detection Logic

1. Identify LDAP-backed login, search, and profile endpoints.
2. Inject LDAP metacharacters (`*`, `)`, `(`, `|`, `&`) in filter-controlled inputs.
3. Compare auth/search behavior for unexpected broad matches or bypass.

## Testing Playbook (curl + browser)

### curl
```bash
# Login bypass probe
curl -i -X POST https://target.tld/login \
  -H "Content-Type: application/json" \
  -d '{"username":"*)(uid=*))(|(uid=*","password":"test"}'

# Directory search manipulation
curl -i "https://target.tld/api/users?query=*)(mail=*)"
```

### Browser / agent-browser
1. Test username/email fields tied to enterprise SSO or internal directory search.
2. Replay requests with LDAP control characters in identity inputs.
3. Verify whether unauthorized accounts can be enumerated or authenticated.

## Verification Criteria

- Vulnerable if injected filter syntax changes authentication/search logic.
- Not vulnerable if input is safely escaped before directory query construction.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://owasp.org/www-community/attacks/LDAP_Injection
- https://portswigger.net/kb/issues/00100500_ldap-injection

