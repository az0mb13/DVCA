---
id: file-upload
name: File Upload Security Testing
version: 1.0.0
domain: security
tags: [security, file-upload, validation, malware, traversal]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test upload endpoints for dangerous file types, MIME confusion, storage misconfiguration, and direct execution risk.

## Detection Logic

1. Test extension and MIME validation bypass.
2. Test filename/path handling and metadata processing.
3. Test access control and execution in storage location.

## Testing Playbook (curl + browser)

### curl
```bash
# Upload with mismatched extension and MIME
curl -i -X POST https://target.tld/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@payload.php.jpg;type=image/jpeg"

# Double extension probe
curl -i -X POST https://target.tld/api/upload \
  -F "file=@avatar.jpg.php;type=image/jpeg"

# Filename traversal probe
curl -i -X POST https://target.tld/api/upload \
  -F "file=@avatar.png;filename=../../tmp/poc.png"
```

### Browser / agent-browser
1. Use upload forms with altered filenames and content types.
2. After upload, access returned URL directly and verify execution/serving behavior.
3. Check whether private uploads are accessible without auth.

## Verification Criteria

- Vulnerable if executable or disallowed file can be uploaded and reached/executed.
- Vulnerable if traversal in filename/path affects storage location.
- Not vulnerable if strict validation, safe storage, and controlled retrieval are enforced.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Business_Logic_Testing/09-Test_Upload_of_Unexpected_File_Types

