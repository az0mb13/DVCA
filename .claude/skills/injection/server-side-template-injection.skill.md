---
id: server-side-template-injection
name: Server-Side Template Injection Testing
version: 1.0.0
domain: security
tags: [security, ssti, injection, rce, templates]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-10
---

## Overview

Test server-rendered template contexts for expression evaluation of untrusted input. SSTI can lead from data disclosure to full remote code execution.

## Detection Logic

1. Identify template-backed pages (emails, previews, CMS blocks, profile rendering).
2. Inject arithmetic and object-introspection probes per template engine.
3. Escalate only with non-destructive payloads and confirm server-side execution.

## Testing Playbook (curl + browser)

### curl
```bash
# Generic arithmetic probe
curl -i "https://target.tld/profile?bio={{7*7}}"

# Jinja/Twig style object probe
curl -i "https://target.tld/preview?content={{self}}"

# Java EL style probe
curl -i "https://target.tld/view?name=${7*7}"
```

### Browser / agent-browser
1. Locate rich-text/template preview features and comment/email rendering paths.
2. Inject low-risk probe expressions and compare rendered output.
3. Validate expression execution on the server and impacted privilege boundary.

## Verification Criteria

- Vulnerable if template expressions execute or resolve sensitive server objects.
- Not vulnerable if input is treated as inert text and escaped consistently.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/web-security/server-side-template-injection
- https://portswigger.net/kb/issues/00101080_server-side-template-injection

