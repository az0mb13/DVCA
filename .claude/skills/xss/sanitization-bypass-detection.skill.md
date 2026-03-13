---
id: sanitization-bypass-detection
name: XSS Sanitization Bypass Detection
version: 1.0.0
domain: xss
tags: [xss, sanitization, bypass, static-analysis]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/sast]
confidence: medium
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect improper sanitization patterns that can be bypassed. Many applications attempt to sanitize user input but use weak or incorrect methods.

## Blacklist-based Sanitization

### Dangerous Patterns - Script Tag Blacklist
```javascript
// BYPASSABLE - Simple regex replacement
function sanitize(input) {
  return input.replace(/<script>/g, '').replace(/<\/script>/g, '');
}

// Bypass: <scr<script>ipt>alert(1)</scr<script>ipt>
// Bypass: <SCRIPT>alert(1)</SCRIPT> (case sensitivity)
```

### Detection Commands
```bash
# Find weak blacklist patterns
rg "replace.*script" --type js --type ts --type py --type php -n
rg "replace.*<script>" -i -n

# Find case-insensitive replace that might still be bypassable
rg "replace\(.*script.*gi" --type js -n
```

### Event Handler Blacklist
```javascript
// BYPASSABLE - Event handler blacklist
function sanitize(input) {
  return input.replace(/onerror=/gi, '')
              .replace(/onload=/gi, '')
              .replace(/onclick=/gi, '');
}

// Bypasses: onerror =alert(1), onERROR=alert(1), onpointerdown=alert(1)
```

### Detection Commands
```bash
# Find event handler blacklists
rg "replace.*onerror" -i -n
rg "replace.*onload" -i -n
rg "replace.*onclick" -i -n
```

## Insufficient Encoding

### HTML Entity Encoding Only
```javascript
// BYPASSABLE - Only encodes < and >
function sanitize(input) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Bypass in attribute context: " onmouseover=alert(1)
```

### Detection Commands
```bash
# Find incomplete encoding
rg "replace.*&lt;" --type js --type ts -n | rg -v "&quot;|&#x27;"
```

## Regex Pattern Issues

### Missing Global Flag
```javascript
// BYPASSABLE - Only replaces first occurrence
function sanitize(input) {
  return input.replace(/<script>/, '');  // No 'g' flag
}

// Bypass: <script><script>alert(1)</script>
```

### Detection Commands
```bash
# Find replace without global flag (JavaScript)
rg "\.replace\s*\(\s*/[^/]+/\s*,\s*" --type js --type ts -n | rg -v "/g"
```

## Context Mismatches

### Wrong Encoding Type
```javascript
// WRONG - JavaScript encoding for HTML
function sanitize(input) {
  return input.replace(/</g, '\\u003c');  // Wrong context!
}
```

### Detection Commands
```bash
# Find Unicode escape encoding
rg "replace.*\\\\u003c" --type js -n
```

## Custom Sanitizer Issues

### String-based HTML Parsing
```javascript
// BYPASSABLE - Naive tag stripping
function stripTags(input) {
  return input.replace(/<[^>]+>/g, '');
}

// Bypass: <img src=x onerror="alert(1)" > (space before >)
```

### Detection Commands
```bash
# Find custom sanitization functions
rg "function\s+sanitize\s*\(" --type js --type ts -n
rg "function\s+cleanHtml\s*\(" --type js --type ts -n
rg "strip.*tags" -i --type js --type ts --type php -n
rg "remove.*script" -i -n
```

## Incomplete DOMPurify Usage

### Missing Config
```javascript
// BYPASSABLE - Default config may allow risky attributes
import DOMPurify from 'dompurify';

function sanitize(input) {
  return DOMPurify.sanitize(input);  // Check configuration!
}
```

### Detection Commands
```bash
# Find DOMPurify usage
rg "DOMPurify\.sanitize" --type js --type ts -n

# Check for RETURN_DOM (wrong return type)
rg "RETURN_DOM\s*:\s*true" --type js --type ts -n
```

## React - Weak URL Validation

### Bypassable URL Check
```jsx
// BYPASSABLE - URL validation bypass
function SafeLink({ url }) {
  if (url.startsWith('http')) {
    return <a href={url}>Link</a>;
  }
}

// Bypass: http://example.com\njavascript:alert(1)
```

### Detection Commands
```bash
# Find weak URL validation
rg "startsWith\s*\(\s*[\"']http[\"']" --type js --type ts --type jsx --type tsx -n
rg "\.indexOf\s*\(\s*[\"']http[\"']" --type js --type ts -n
```

## Encoding Order Issues

### Double Encoding
```javascript
// BYPASSABLE - Wrong encoding order
function sanitize(input) {
  let safe = input.replace(/</g, '&lt;');
  return encodeURIComponent(safe);  // Wrong for HTML context
}
```

## Framework-Specific Bypasses

### Django - Markup Chain
```python
# BYPASSABLE - Multiple mark_safe calls
from django.utils.safestring import mark_safe
from bleach import clean

# Good
content = mark_safe(clean(user_input))

# Risky - if clean result is modified
content = mark_safe(clean(user_input) + extra_html)
```

### Detection Commands
```bash
# Find mark_safe with string concatenation
rg "mark_safe.*\+" --type py -n
```

## Detection Patterns

### Common Weak Patterns
```bash
# Find custom sanitization
echo "=== Custom sanitization functions ==="
rg "def\s+sanitize|def\s+clean" --type py -n
rg "function\s+sanitize|function\s+clean" --type js --type ts -n

# Find regex-based sanitization
echo "=== Regex sanitization ==="
rg "replace\s*\(/" --type js --type ts -n

# Find blacklist patterns
echo "=== Blacklist patterns ==="
rg "script|onerror|onload|onclick" --type js -n | rg "replace"
```

## Verification Steps

### Step 1: Identify Sanitization Functions
```bash
# Find all custom sanitization
rg "def\s+sanitize|def\s+clean_html" --type py -l
rg "function\s+sanitize|function\s+stripTags" --type js -l
```

### Step 2: Test for Bypass Vectors
Look for these patterns in code:
- Case variation handling: `<SCRIPT>`, `<Script>`
- Encoding handling: `<scr\x00ipt>`
- Nesting handling: `<scr<script>ipt>`
- Whitespace handling: `<script >`
- Alternative tags: `<svg>`, `<img>`

### Step 3: Check Context Appropriateness
```bash
# Is encoding appropriate for the output context?
# Check the sink where sanitized data is used
echo "=== Sanitization output to sink ==="
for file in $(rg "sanitize|clean|escape" --type js -l); do
    if rg -q "\.innerHTML\s*=|\.outerHTML\s*=" "$file"; then
        echo "Review: $file"
    fi
done
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [OWASP XSS Filter Evasion](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [DOMPurify Configuration](https://github.com/cure53/DOMPurify#can-i-configure-dompurify)

## Testing Playbook (curl + browser)

### curl
```bash
# Send bypass candidates through input endpoint
curl -i -X POST https://target.tld/api/comment \
  -H "Content-Type: application/json" \
  -d '{"text":"<img src=x onerror=alert(1)>"}'
```

### Browser / agent-browser
1. Submit payload variants that target known sanitizer weaknesses.
2. Inspect stored output and rendered DOM, not just raw API response.
3. Confirm sanitization is context-aware and blocks script/event execution.
