---
id: tech-graphql
name: GraphQL Security Patterns
version: 1.0.0
domain: technologies
tags: [technology, graphql, security, api]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test GraphQL endpoints for introspection exposure, broken authorization (BOLA/BFLA), excessive data exposure, and query abuse (depth/complexity).

## Detection Logic

1. Identify GraphQL endpoints and operation patterns used by the app.
2. Test schema discovery and sensitive field access.
3. Test object-level auth by swapping identifiers and roles.
4. Test query depth/alias abuse to evaluate denial-of-service controls.

## Detection Steps

1. Discover `/graphql` or custom route and capture baseline queries.
2. Probe introspection and field-level auth.
3. Replay user queries with modified IDs and nested fields.
4. Measure response behavior for high-depth and high-alias requests.

## Payloads

```graphql
# Introspection
{ __schema { types { name } } }

# IDOR/BOLA candidate
query { invoice(id:"1001") { id userId total cardLast4 } }

# Excessive nesting candidate
query {
  user(id:"1") {
    posts { comments { author { posts { id } } } }
  }
}
```

## Testing Playbook (curl + browser)

### curl
```bash
# Introspection check
curl -i https://target.tld/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'

# Object auth check
curl -i https://target.tld/graphql \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{invoice(id:\"1001\"){id,userId,total}}"}'
```

### Browser / agent-browser
1. Capture GraphQL requests from UI in DevTools.
2. Replay with altered object IDs, role-sensitive fields, and nested selections.
3. Verify unauthorized fields/objects return deny responses.
4. Validate client cannot read sensitive fields not needed by UI.

## Verification Criteria

- Vulnerable if unauthorized object/field access succeeds.
- Vulnerable if introspection is enabled in production against policy.
- Vulnerable if depth/complexity limits are missing and heavy queries are accepted.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html
- https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/
