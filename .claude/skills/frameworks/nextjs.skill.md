---
id: framework-nextjs
name: Next.js Security Patterns
version: 1.0.0
domain: frameworks
tags: [framework, nextjs, security, auth, headers, xss]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/web]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Audit security controls specific to Next.js apps: route handlers, middleware auth gates, server actions, cookie/session handling, and security headers.

## Detection Logic

1. Verify authentication and authorization in `app/api/*` and `pages/api/*`.
2. Verify protected pages do not leak data via parallel API routes.
3. Verify cookie flags and security headers on both page and API responses.
4. Verify rendering paths avoid unsafe HTML insertion.

## Testing Playbook (curl + browser)

### curl
```bash
# Unauthorized access check on admin API route
curl -i https://target.tld/api/admin/users

# Low-privilege token against privileged endpoint
curl -i -H "Authorization: Bearer $USER_TOKEN" \
  https://target.tld/api/admin/users

# Security header check
curl -I https://target.tld/
```

### Browser / agent-browser
1. Open a protected page URL directly and verify redirect/deny behavior.
2. Replay requests from Network tab as a low-privilege user.
3. Inspect bundle and runtime config for accidental secret exposure.
4. Verify `dangerouslySetInnerHTML` paths cannot receive unsanitized input.

## Code Review Queries

```bash
rg -n --glob '!node_modules/**' --glob '!vendor/**' "dangerouslySetInnerHTML|innerHTML" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "app/api|pages/api|middleware\\.ts|middleware\\.js" .
rg -n --glob '!node_modules/**' --glob '!vendor/**' "NEXT_PUBLIC_|process\\.env" .
```

## Verification Criteria

- Vulnerable if sensitive API routes allow unauthorized access.
- Vulnerable if route protection is client-only and data endpoints remain exposed.
- Vulnerable if auth cookies or headers are missing on critical paths.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://nextjs.org/docs/app/building-your-application/authentication
- https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
