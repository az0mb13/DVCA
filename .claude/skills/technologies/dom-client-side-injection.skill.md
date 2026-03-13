---
id: dom-client-side-injection
name: DOM-Based Client-Side Injection Testing
version: 1.0.0
domain: security
tags: [security, dom, client-side, csti, javascript, websocket]
tools_required: [agent-browser, rg]
agent_scope: [specialist/security, specialist/frontend]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test browser-side sinks that consume attacker-controlled data from URL, hash, storage, or message channels. This includes DOM XSS/JS injection and related client-side manipulation classes.

## Detection Logic

1. Identify untrusted DOM sources (`location`, `document.referrer`, `postMessage`, storage).
2. Trace source-to-sink paths (`innerHTML`, `eval`, dynamic URLs, WebSocket constructors, form/link actions).
3. Confirm exploitable sink behavior with non-destructive proof payloads.

## Testing Playbook (browser + static scan)

### Browser / agent-browser
1. Inject payloads through query/hash/fragment and observe SPA routing and rendering.
2. Test dynamic URL constructors (fetch/WebSocket/src/href/action) for attacker influence.
3. Validate whether sanitization and allowlisting block unsafe transformations.

### Static scan (`rg`)
```bash
# Common dangerous sinks
rg "innerHTML\\s*=|outerHTML\\s*=|insertAdjacentHTML|eval\\(|Function\\(|setTimeout\\(.*string|setInterval\\(.*string" --type js --type ts -n

# URL/source-driven operations
rg "location\\.(search|hash|href)|document\\.referrer|postMessage|localStorage|sessionStorage|new WebSocket\\(" --type js --type ts -n
```

## Verification Criteria

- Vulnerable if attacker-controlled client input reaches sensitive sinks and changes execution/security behavior.
- Not vulnerable if untrusted input is constrained, validated, and sink-safe encoded.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/web-security/cross-site-scripting/dom-based
- https://portswigger.net/web-security/dom-based

