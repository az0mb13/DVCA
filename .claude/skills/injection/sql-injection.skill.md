---
id: sql-injection
name: SQL Injection Testing
version: 1.0.0
domain: security
tags: [security, sqli, injection, database, api]
tools_required: [curl, agent-browser, rg]
agent_scope: [specialist/security, specialist/backend]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test input points that influence SQL queries (OWASP A03). Check for boolean, error-based, and time-based SQL injection across query params, JSON, and headers.

## Detection Logic

1. Identify database-backed endpoints (search, filters, sort, login).
2. Inject syntax-breaking and conditional payloads.
3. Compare response code/body/timing for behavior changes.
4. Confirm exploitability without destructive payloads.

## Testing Playbook (curl + browser)

### curl
```bash
# Boolean-based check
curl -i "https://target.tld/api/users?name=' OR '1'='1"

# Error-based signal
curl -i "https://target.tld/api/users?sort=created_at'--"

# Time-based check (PostgreSQL style)
time curl -i "https://target.tld/api/users?name=a';SELECT pg_sleep(5)--"

# JSON body injection
curl -i -X POST https://target.tld/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"x\" OR 1=1 --"}'
```

### Browser / agent-browser
1. Replay captured XHR/fetch requests with modified parameters.
2. Test filter/sort/search UI fields with injection payloads.
3. Compare normal vs payload responses and latency.

## Verification Criteria

- Vulnerable if payload changes result set unexpectedly, triggers SQL error leakage, or causes controlled delay.
- Not vulnerable if parameterized handling blocks payload and response remains stable.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/Top10/2021/A03_2021-Injection/
- https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection
- https://owasp.org/www-project-cheat-sheets/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

