---
id: framework-nuxt
name: Nuxt/Nitro Security Patterns
version: 1.1.0
domain: frameworks
tags: [framework, nuxt, nitro, security, auth, headers, xss]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-09
---

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "server/api|defineEventHandler|readBody\\(|sendStream\\(|setHeader\\(" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "runtimeConfig|useRuntimeConfig|process\\.env|public:" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "v-html|marked\\(|innerHTML|dangerouslySetInnerHTML" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "cookie|csrf|Authorization|bearer|rate|limit|cors|zod|schema|max|min" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "serverMode|NUXT_PUBLIC_SERVER_MODE|runtimeConfig\\.public\\.serverMode" .
```

## References

- https://nuxt.com/docs/guide/concepts/server-engine
- https://nuxt.com/docs/guide/going-further/runtime-config
- https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html

## Overview

Audit Nuxt/Nitro apps for insecure server routes, runtime config exposure, missing API access controls, weak rate limiting, and client-side HTML injection sinks.

## Detection Logic

1. Verify `server/api/*` endpoints enforce authentication/authorization where secrets or paid APIs are used.
2. Verify `runtimeConfig.public` never includes secrets and private keys remain server-only.
3. Verify state-changing endpoints have abuse controls (rate limit, quotas, abuse detection).
4. Verify markdown/rendering paths (`v-html`, `marked`) are sanitized before rendering untrusted content.
5. Verify `serverMode` deployments do not expose unauthenticated high-cost API routes.
6. Verify request bodies include server-side bounds (depth, breadth, size limits), not only client UI limits.

## Testing Playbook (curl + browser)

### curl
```bash
# Check anonymous access to expensive/protected API routes
curl -i https://target.tld/api/admin/stats
curl -i -X POST https://target.tld/api/search \
  -H "Content-Type: application/json" \
  -d '{"q":"test"}'

# Check security headers and route policy
curl -I https://target.tld/
curl -I https://target.tld/api/search
```

### Browser / agent-browser
1. Trigger authenticated and anonymous product flows and inspect requests to Nitro APIs.
2. Verify unauthorized users cannot invoke server-side key-backed features.
3. Probe markdown rendering with controlled payloads and confirm script execution is impossible.
4. Validate client storage does not expose server secrets in server mode.
5. Validate links rendered from untrusted markdown enforce safe URL schemes and `rel="noopener noreferrer"`.

## Verification Criteria

- Vulnerable if anonymous clients can consume server-side secrets or paid API quotas.
- Vulnerable if untrusted markdown/HTML reaches `v-html` without sanitization.
- Vulnerable if abuse controls are absent on high-cost APIs.
- Vulnerable if server trusts only client-side numeric bounds for expensive operations.

## False Positive Triage

1. Do not report missing auth on routes that are intentionally public and do not consume sensitive data, paid resources, or privileged actions.
2. For markdown sinks, only report when input is attacker-controlled (user content, model output, or third-party scrape output), not static literals.
3. Do not report client-side `min/max` input constraints as server protections unless server-side validation is present.
4. For link-based XSS claims, verify that dangerous schemes (for example `javascript:`) or DOM event handlers can survive rendering.

## Evidence Checklist

- Capture endpoint, method, payload, and response evidence.
- Capture server-mode or feature-flag prerequisites.
- Capture exploit impact (cost, data exposure, account/system compromise).
