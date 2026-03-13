---
id: framework-aspnet
name: ASP.NET Security Misconfiguration Patterns
version: 1.0.0
domain: security
tags: [security, aspnet, viewstate, tracing, debugging, iis]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/backend]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test ASP.NET deployments for high-risk misconfigurations commonly surfaced by scanners: tracing/debugging enabled, weak ViewState protection, and verbose diagnostic exposure.

## Detection Logic

1. Identify ASP.NET/IIS application fingerprints and diagnostic endpoints.
2. Probe tracing/debug settings and ViewState protection behavior.
3. Confirm whether production routes expose internals or accept unsafe state manipulation.

## Testing Playbook (curl + browser)

### curl
```bash
# Trace endpoint probe (legacy apps)
curl -i https://target.tld/trace.axd

# Generic diagnostics probe
curl -i https://target.tld/elmah.axd

# ViewState surface check
curl -i https://target.tld/ | rg -n "__VIEWSTATE|__EVENTVALIDATION"
```

### Browser / agent-browser
1. Navigate error/diagnostic routes and inspect stack traces/environment leakage.
2. Check whether debug pages are reachable without privileged access.
3. Capture ViewState handling behavior in forms on sensitive workflows.

## Verification Criteria

- Vulnerable if tracing/debug/diagnostic features are exposed in production or ViewState integrity is weak.
- Not vulnerable if diagnostics are disabled/restricted and state integrity is cryptographically protected.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/kb/issues/00100280_asp-net-tracing-enabled
- https://portswigger.net/kb/issues/00100800_asp-net-debugging-enabled
- https://portswigger.net/kb/issues/00400600_asp-net-viewstate-without-mac-enabled

