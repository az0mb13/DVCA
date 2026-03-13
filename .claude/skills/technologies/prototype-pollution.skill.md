---
id: prototype-pollution
name: Client-Side Prototype Pollution Testing
version: 1.0.0
domain: security
tags: [security, javascript, prototype-pollution, dom]
tools_required: [agent-browser, rg]
agent_scope: [specialist/security, specialist/frontend]
confidence: medium
source: internal
created_at: 2026-03-10
---

## Overview

Test JavaScript object merge and query parsing flows for unsafe prototype mutation. Pollution can alter security logic and enable follow-on DOM-based vulnerabilities.

## Detection Logic

1. Locate deep-merge or query-to-object code paths (`Object.assign`, merge helpers, parser libs).
2. Inject `__proto__`, `prototype`, and `constructor` keys through URL/hash/body input.
3. Verify global object property pollution and downstream security impact.

## Testing Playbook (browser + static scan)

### Browser / agent-browser
1. Navigate to pages processing URL parameters into config/state objects.
2. Inject probes like `?__proto__[polluted]=true`.
3. Validate pollution effect using benign checks in app behavior or console.

### Static scan (`rg`)
```bash
# Candidate merge sinks
rg "Object\\.assign|merge\\(|deepMerge|lodash\\.merge|qs\\.parse" --type js --type ts -n

# Candidate dangerous property keys
rg "__proto__|constructor\\.prototype|prototype\\s*:" --type js --type ts -n
```

## Verification Criteria

- Vulnerable if attacker-controlled keys mutate object prototypes across app scope.
- Not vulnerable if polluted keys are blocked and merge logic is hardened.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.

## References

- https://portswigger.net/web-security/prototype-pollution
- https://portswigger.net/kb/issues/00200316_client-side-prototype-pollution

