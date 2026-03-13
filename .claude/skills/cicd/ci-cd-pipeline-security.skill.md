---
id: ci-cd-pipeline-security
name: CI/CD Pipeline Security Testing
version: 1.0.0
domain: security
tags: [security, cicd, pipeline, devsecops]
tools_required: [curl, rg]
agent_scope: [specialist/security, specialist/devsecops]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Assess CI/CD workflows for secret exposure, untrusted code execution, insecure runners, and weak release controls.

## Detection Logic

1. Review workflow triggers and trust boundaries (PRs, forks, tags).
2. Review secret access in jobs and artifact handling.
3. Review deployment gating and environment protections.

## Testing Playbook (curl + browser)

### curl
```bash
# Example: inspect public workflow files directly
curl -i https://raw.githubusercontent.com/<org>/<repo>/main/.github/workflows/ci.yml
```

### Browser / agent-browser
1. Inspect pipeline config for unsafe `pull_request_target` usage and untrusted script execution.
2. Verify protected environments/manual approvals for production deploys.
3. Check artifact retention and tamper protections.

## Verification Criteria

- Vulnerable if untrusted code can run with privileged tokens/secrets.
- Vulnerable if production deployment lacks approval or branch protection controls.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://owasp.org/www-project-top-10-ci-cd-security-risks/
