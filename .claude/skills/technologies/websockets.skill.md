---
id: tech-websockets
name: WebSocket Security Patterns
version: 1.0.0
domain: technologies
tags: [technology, websockets, security, realtime]
tools_required: [curl, agent-browser]
agent_scope: [specialist/security, specialist/api-security]
confidence: high
source: internal
created_at: 2026-03-09
---

## Overview

Test WebSocket implementations for weak handshake auth, missing origin checks, insecure channel authorization, and message-level access control failures.

## Detection Logic

1. Verify authentication at connect time and on message actions.
2. Verify origin checks and CSWSH protection.
3. Verify subscription/channel authorization per user/tenant.
4. Verify rate controls and payload size limits.

## Detection Steps

1. Capture WebSocket handshake and auth token transport.
2. Attempt unauthenticated and cross-origin handshakes.
3. Attempt subscribing to other users' channels.
4. Send malformed/oversized message payloads.

## Payloads

- Cross-origin handshake with attacker origin.
- Unauthorized `subscribe` for another tenant.
- Rapid message flood payload.

## Testing Playbook (curl + browser)

### curl
```bash
# Handshake probe with attacker origin
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Origin: https://evil.tld" \
  https://target.tld/socket
```

### Browser / agent-browser
1. Observe WebSocket handshake in DevTools and confirm auth enforcement.
2. Attempt connection from different origin context.
3. Try unauthorized room/topic subscriptions and cross-user event reads.
4. Validate server closes unauthorized or abusive sessions.

## Verification Criteria

- Vulnerable if unauthenticated/cross-origin connections are accepted improperly.
- Vulnerable if user can subscribe/publish outside authorized scope.
- Vulnerable if no message-level authz/rate controls exist.

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html
- https://datatracker.ietf.org/doc/html/rfc6455
