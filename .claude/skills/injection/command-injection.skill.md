---
id: command-injection
name: OS Command Injection Testing
version: 1.0.0
domain: security
tags: [security, command-injection, rce, input-validation]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test endpoints that pass user input into shell/system commands. Focus on separators, command substitution, and argument injection.

## Detection Logic

1. Find features likely to call shell utilities (ping, convert, zip, git, backup).
2. Inject harmless separators and timing payloads.
3. Observe response/body/time changes indicating command execution.

## Testing Playbook (curl + browser)

### curl
```bash
# Separator-based payload
curl -i "https://target.tld/api/ping?host=127.0.0.1;id"

# Command substitution
curl -i "https://target.tld/api/ping?host=\$(whoami)"

# Time-based payload
time curl -i "https://target.tld/api/ping?host=127.0.0.1;sleep 5"
```

### Browser / agent-browser
1. Test UI features that execute diagnostics/export/processing tasks.
2. Replay requests with injected separators in relevant fields.
3. Check output snippets and timing anomalies.

## Verification Criteria

- Vulnerable if command output appears in response/log path or timing confirms execution.
- Not vulnerable if input is safely parsed and treated as data only.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-community/attacks/Command_Injection
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/07-Input_Validation_Testing/12-Testing_for_Command_Injection

