---
id: container-kubernetes-security
name: Container and Kubernetes Security Testing
version: 1.0.0
domain: security
tags: [security, cloud, container, kubernetes]
tools_required: [curl, rg]
agent_scope: [specialist/security, specialist/cloud-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Assess containerized workloads and Kubernetes configurations for privilege, secret, network, and runtime isolation weaknesses.

## Detection Logic

1. Review pod security context and privilege settings.
2. Review exposed services/ingress and network policy isolation.
3. Review secret mounting and RBAC least privilege.

## Testing Playbook (curl + browser)

### curl
```bash
# Probe publicly exposed cluster/service metadata endpoints (if reachable)
curl -i https://target.tld/metrics
curl -i https://target.tld/actuator
```

### Browser / agent-browser
1. Review deployment manifests in repo/UI for privileged containers.
2. Validate admin dashboards are not publicly exposed.
3. Verify sensitive debug endpoints are not internet-accessible.

## Verification Criteria

- Vulnerable if containers run privileged/root without justification.
- Vulnerable if sensitive internal services/metrics are publicly accessible.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html
