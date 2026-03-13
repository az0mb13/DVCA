---
id: path-traversal
name: Path Traversal and File Inclusion Testing
version: 1.0.0
domain: security
tags: [security, path-traversal, lfi, rfi, files]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test file read/include functionality for directory traversal (`../`) and local/remote file inclusion patterns.

## Detection Logic

1. Identify file/path parameters (`file`, `path`, `template`, `download`).
2. Inject traversal and encoding variants.
3. Confirm access to unintended local files or template sources.

## Testing Playbook (curl + browser)

### curl
```bash
# Basic traversal
curl -i "https://target.tld/download?file=../../../../etc/passwd"

# URL-encoded traversal
curl -i "https://target.tld/download?file=..%2f..%2f..%2f..%2fetc%2fpasswd"

# Null-byte/extension bypass candidate
curl -i "https://target.tld/view?template=../../../../etc/passwd%00.html"
```

### Browser / agent-browser
1. Test download/view/export UI parameters with traversal sequences.
2. Replay XHR/fetch requests from DevTools and mutate path fields.
3. Check for leaked system/app files and stack traces.

## Verification Criteria

- Vulnerable if attacker can read/include files outside intended directory.
- Not vulnerable if canonicalization and allowlist rules block traversal variants.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/Path_Traversal
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Client-side_Testing/12-Testing_for_Local_File_Inclusion

