---
id: javascript-security-analysis
name: JavaScript Security Analysis
version: 1.1.0
domain: technologies
tags: [javascript, typescript, node, frontend, static-analysis, security]
tools_required: [rg]
agent_scope: [specialist/security, specialist/sast]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Review JavaScript/TypeScript codebases for exploitable security flaws: unsafe eval/dynamic code execution, command injection, SSRF-like fetch abuse, insecure auth checks, and untrusted HTML rendering.

This is a triage/orchestration skill for JS/TS audits.
After identifying a candidate class, switch to specialized skills for deep validation (for example: `xss/*`, `injection/command-injection.skill.md`, `web/ssrf.skill.md`, `auth/*`).

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "eval\\(|new Function\\(|setTimeout\\(\\s*['\"]|setInterval\\(\\s*['\"]" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "exec\\(|spawn\\(|execFile\\(|fork\\(|child_process" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "fetch\\(|\\$fetch\\(|axios\\.|got\\(|request\\(" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "innerHTML|outerHTML|dangerouslySetInnerHTML|v-html|marked\\(" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "defineEventHandler|app\\.(get|post|put|delete)|router\\.(get|post|put|delete)|readBody\\(" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "\\.reverse\\(\\)|\\.splice\\([^,\\)]*\\)|push\\(|pop\\(" .
rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!vendor/**' "Map<|\\{\\[name: string\\]|registry|stack|queue|event" .
```

## Detection Logic

1. Find sensitive sinks (code exec, shell exec, HTML injection, outbound requests).
2. Trace attacker-controlled sources into those sinks (query/body/headers/path, model output, third-party content).
3. Verify missing server-side controls (auth, validation, rate limits, bounds).
4. Rank only by demonstrated exploitability and impact.

## Verification Criteria

- Vulnerable if untrusted input reaches executable sink without effective sanitization/validation.
- Vulnerable if high-cost privileged behavior is reachable anonymously.
- Vulnerable if global mutable state used for authorization, routing, or security decisions can be desynchronized (for example by destructive `reverse/splice` misuse).
- Not vulnerable if data path is trusted, constrained, and blocked by server-side controls.

## False Positive Triage

1. Do not report sink-only matches without a realistic attacker-controlled source.
2. Do not treat client-side checks as security controls unless server enforces equivalent checks.
3. For `fetch`/HTTP findings, separate normal API calls from SSRF by checking whether target host/scheme is user-controlled.
4. For XSS findings, verify payload can survive framework escaping and execute in browser context.
5. For state/logic findings, confirm the mutated structure is shared global state and affects security-relevant behavior (access checks, context isolation, or privileged workflow decisions).

## Evidence Checklist

- Source -> sink path with file and line references.
- Required attacker capabilities and prerequisites.
- Concrete impact (data exposure, account abuse, cost amplification, RCE).

## References

- https://owasp.org/www-project-web-security-testing-guide/
- https://cheatsheetseries.owasp.org/
