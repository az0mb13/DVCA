---
id: insecure-deserialization
name: Insecure Deserialization Testing
version: 1.0.0
domain: security
tags: [security, deserialization, rce, injection]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test object/data deserialization paths for unsafe type handling that could lead to code execution, tampering, or privilege abuse.

## Detection Logic

1. Identify serialized payload inputs (cookies, API fields, message queues).
2. Test tampered payload acceptance and type confusion behavior.
3. Check use of unsafe native serializers.

## Testing Playbook (curl + browser)

### curl
```bash
# Tampered serialized blob in cookie/header/body
curl -i https://target.tld/api/profile \
  -H "Cookie: state=$TAMPERED_BLOB"
```

### Browser / agent-browser
1. Capture serialized app state tokens from cookies/local storage.
2. Replay modified payloads and observe trust/authorization behavior.
3. Verify parser rejects untrusted types and invalid signatures.

## Verification Criteria

- Vulnerable if tampered serialized data is trusted or executed.
- Vulnerable if unsafe native deserialization is used on untrusted input.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/vulnerabilities/Insecure_Deserialization
