---
id: hardcoded-api-keys
name: Hardcoded API Keys and Tokens Detection
version: 1.1.0
domain: secrets
tags: [secrets, api-keys, tokens, credentials, leakage]
tools_required: [rg]
agent_scope: [specialist/security, specialist/devsecops]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Detect hardcoded credentials in source code, config files, scripts, and test fixtures, then validate whether findings are real secrets or placeholders.

This skill is intentionally scoped to static repository scanning only.
For runtime leakage checks (responses, bundles, logs, revocation), use `secrets/secrets-management-leakage.skill.md`.

## Code Review Queries

```bash
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' "(api[_-]?key|token|secret|password)\\s*[:=]\\s*['\"][^'\"]{8,}['\"]" .
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' "(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|xox[baprs]-|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,})" .
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' "-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----" .
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' "process\\.env\\.[A-Z0-9_]+\\s*\\|\\|\\s*['\"][^'\"]+['\"]" .
```

## Detection Logic

1. Locate candidate secrets by patterns and assignment context.
2. Classify as production secret, test credential, placeholder, or sample value.
3. Confirm whether value is exposed in client-side/public config or committed server code.
4. Recommend rotation and migration to secret manager/runtime env vars for valid secrets.

## Verification Criteria

- Vulnerable if active secrets/tokens are hardcoded in tracked files.
- Vulnerable if private credentials are embedded in client-exposed code or public runtime config.
- Not vulnerable if values are clearly placeholders/examples and non-functional.
- Out of scope: runtime-only exposures not present in source.

## False Positive Triage

1. Exclude obvious placeholders (`your-key-here`, `example`, `changeme`, masked values like `******`).
2. Exclude docs-only snippets unless copied into executable config/code.
3. Confirm context before reporting high-entropy strings (UUIDs, hashes, IDs are often not credentials).
4. Distinguish demo/test keys from production keys; still report test keys if they appear valid and reusable.

## Evidence Checklist

- File path and line with value context.
- Why it is likely active (format/provider/context).
- Exposure scope (server-only, client bundle, repo history).
- Rotation/cleanup recommendations.

## References

- https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- https://owasp.org/www-project-top-ten/
