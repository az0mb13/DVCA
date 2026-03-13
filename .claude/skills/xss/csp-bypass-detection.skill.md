---
id: csp-bypass-detection
name: CSP Bypass & Weakness Detection
version: 1.0.0
domain: xss
tags: [xss, csp, content-security-policy, config]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/sast]
confidence: medium
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect weak or bypassable Content Security Policy (CSP) configurations in code.

## Dangerous CSP Directives

### unsafe-inline
```http
# WEAK - Allows all inline scripts
Content-Security-Policy: script-src 'unsafe-inline';
Content-Security-Policy: default-src 'self' 'unsafe-inline';
```

### unsafe-eval
```http
# WEAK - Allows eval() and similar
Content-Security-Policy: script-src 'self' 'unsafe-eval';
```

### Wildcard Sources
```http
# WEAK - Allows scripts from any HTTPS
Content-Security-Policy: script-src https:;
Content-Security-Policy: script-src *;

# WEAK - Any subdomain
Content-Security-Policy: script-src *.google.com;
```

### Data Protocol
```http
# WEAK - Allows data: URIs for scripts
Content-Security-Policy: script-src 'self' data:;
```

### Detection Commands
```bash
# Find unsafe-inline
rg "unsafe-inline" --type conf --type js --type py -n

# Find unsafe-eval
rg "unsafe-eval" --type conf --type js --type py -n

# Find wildcard script sources
rg "script-src\s+https:\s*;" -n
rg "script-src\s+\*" -n

# Find data: in script-src
rg "script-src[^;]*data:" -n
```

## JSONP Endpoints

### Bypass via JSONP
```javascript
// If CSP allows scripts from trusted.com
// And trusted.com has JSONP endpoint:
// JSONP endpoint at trusted.com/api/data?callback=alert
// Bypass: <script src="https://trusted.com/api/data?callback=alert(1)"></script>
```

### Detection Commands
```bash
# Find JSONP endpoints
rg "callback\s*=" --type js --type ts --type py --type php -n
rg "jsonp\s*=" -i -n

# Find callback parameter handling
rg "req\.query\.callback|request\.GET\.get\s*\(\s*['\"]callback" -n
```

## Missing Directives

### Missing default-src
```http
# REVIEW - No default fallback. Can still be acceptable if fetch directives are explicitly and safely defined.
Content-Security-Policy: script-src 'self';
# object-src, base-uri not defined
```

### Missing base-uri
```http
# REVIEW - Missing base-uri can increase abuse options in some apps.
Content-Security-Policy: script-src 'self';
# No base-uri directive
```

### Missing frame-ancestors
```http
# REVIEW - Missing frame-ancestors may allow framing/clickjacking unless otherwise protected.
Content-Security-Policy: script-src 'self';
# No frame-ancestors directive
```

### Detection Commands
```bash
# Check for directive review candidates
echo "=== Review candidates: CSP without default-src ==="
for file in $(rg -l "Content-Security-Policy" --type js --type py --type conf); do
    if ! rg -q "default-src" "$file"; then
        echo "$file"
    fi
done

echo "=== Review candidates: CSP without base-uri ==="
for file in $(rg -l "Content-Security-Policy" --type js --type py --type conf); do
    if ! rg -q "base-uri" "$file"; then
        echo "$file"
    fi
done

echo "=== Review candidates: CSP without frame-ancestors ==="
for file in $(rg -l "Content-Security-Policy" --type js --type py --type conf); do
    if ! rg -q "frame-ancestors" "$file"; then
        echo "$file"
    fi
done
```

## Framework-Specific CSP Issues

### Express with Helmet
```javascript
// DANGEROUS - Weak helmet config
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
  }
}));

// DANGEROUS - Report only
app.use(helmet.contentSecurityPolicy({
  reportOnly: true
}));
```

### Detection Commands
```bash
# Find Express helmet CSP config
rg "contentSecurityPolicy" --type js -n

# Find unsafe directives in helmet
rg "scriptSrc.*unsafe" --type js -n

# Find reportOnly mode
rg "reportOnly.*true" --type js -n
```

### Django CSP
```python
# settings.py
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")  # WEAK
CSP_INCLUDE_NONCE_IN = []  # Missing nonces
```

### Detection Commands
```bash
# Find Django CSP settings
rg "CSP_SCRIPT_SRC" --type py -n
rg "CSP.*unsafe" --type py -n
```

### Nginx Config
```nginx
# WEAK CSP in nginx
add_header Content-Security-Policy "script-src 'self' 'unsafe-inline'" always;
```

### Detection Commands
```bash
# Find CSP in nginx config
rg "add_header.*Content-Security-Policy" --type conf -n
rg "Content-Security-Policy.*unsafe" --type conf -n
```

## CSP in Meta Tags

### Meta Tag CSP
```html
<!-- WEAK - CSP in meta tag can't use report-uri, frame-ancestors -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' 'unsafe-inline'">
```

### Detection Commands
```bash
# Find CSP in meta tags
rg "http-equiv.*Content-Security-Policy" --type html -n
rg "meta.*Content-Security-Policy" --type html -n
```

## Report-Only Mode

### Report-Only Forever
```http
# WEAK - CSP in report-only mode doesn't block
Content-Security-Policy-Report-Only: script-src 'self';
```

### Detection Commands
```bash
# Find report-only CSP
rg "Content-Security-Policy-Report-Only" -n
```

## Detection Commands Summary

### Find CSP Configurations
```bash
# Search for CSP headers in code
echo "=== Content-Security-Policy configurations ==="
rg "Content-Security-Policy" -n

# Check framework configs
echo "=== Express/Node CSP ==="
rg "contentSecurityPolicy" --type js -n

echo "=== Django CSP ==="
rg "CSP_" --type py -n

echo "=== Nginx CSP ==="
rg "Content-Security-Policy" --type conf -n
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Guide](https://csp.withgoogle.com/docs/index.html)

## Testing Playbook (curl + browser)

### curl
```bash
# Check CSP and report-only headers
curl -I https://target.tld/
curl -s -D- https://target.tld/ -o /dev/null | rg -i "content-security-policy|content-security-policy-report-only"
```

### Browser / agent-browser
1. Open DevTools and verify effective CSP in response headers.
2. Try safe PoC payloads in reflected inputs and confirm blocking/violation reports.
3. Validate inline script/style execution is blocked when expected.
