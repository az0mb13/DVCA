---
id: dependency-sca
name: Dependency and Supply Chain Security Testing
version: 1.0.0
domain: security
tags: [security, dependencies, supply-chain, sca]
tools_required: [curl, rg]
agent_scope: [specialist/security, specialist/devsecops]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Assess third-party dependencies and build artifacts for known vulnerabilities, typosquatting risk, and insecure update strategy.

## Detection Logic

1. Inventory dependencies and lockfile integrity.
2. Check known CVEs and vulnerable transitive packages.
3. Classify reachability by environment (`dependencies` runtime vs `devDependencies`/tooling only).
4. Verify pinning, signature/provenance, and update cadence.

## Testing Playbook (curl + browser)

### curl
```bash
# Verify package metadata and publication origin for suspicious package
curl -s https://registry.npmjs.org/<package-name> | head -n 40
```

### Browser / agent-browser
1. Review package source, maintainer history, and release anomalies.
2. Verify dependency update policy and vulnerability triage workflow in CI.
3. Confirm lockfiles are committed and reviewed.

## Verification Criteria

- Vulnerable if critical known-vulnerable packages are present without containment controls.
- Vulnerable if dependency integrity/provenance controls are absent.
- High confidence if vulnerable package is in production runtime path or handles attacker-controlled input.
- Lower confidence if vulnerability is limited to local build/test/CLI workflows and requires developer interaction.

## False Positive Triage

1. Separate root package runtime impact from example/demo app impact.
2. Confirm whether the vulnerable package is `dev`, `devOptional`, or production in lockfile metadata.
3. Do not assign production severity to vulnerabilities reachable only in local tooling.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html
