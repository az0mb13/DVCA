---
id: dom-xss-sources-detection
name: DOM XSS Sources Detection
version: 1.0.0
domain: xss
tags: [xss, dom, sources, static-analysis]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/sast]
confidence: high
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect DOM XSS vulnerabilities by identifying sources (user-controlled inputs) and their flow to sinks.

## DOM XSS Sources

### Location-based Sources
```javascript
// URL-based sources
location.hash          // #fragment
location.href          // Full URL
location.search        // ?query=params
location.pathname      // /path/to/page
document.URL           // Full URL
document.documentURI   // Full URL
document.baseURI       // Base URL
location.host          // hostname:port
location.hostname      // hostname only
```

### Detection Commands
```bash
# Find location sources
echo "=== Location sources ==="
rg "location\.hash" --type js --type ts -n
rg "location\.href" --type js --type ts -n
rg "location\.search" --type js --type ts -n
rg "location\.pathname" --type js --type ts -n
rg "document\.URL|document\.documentURI" --type js --type ts -n
```

### Document Referrer
```javascript
document.referrer      // Previous page URL
```

### Window Name
```javascript
window.name            // Can be set by opener window
```

### Detection Commands
```bash
# Find referrer and window.name
rg "document\.referrer" --type js --type ts -n
rg "window\.name" --type js --type ts -n
```

### postMessage Sources
```javascript
// In receiver
window.addEventListener('message', (event) => {
  const data = event.data;  // Source - can be controlled by sender
  const origin = event.origin;  // Check this!
});
```

### Detection Commands
```bash
# Find postMessage handlers
echo "=== postMessage handlers ==="
rg "addEventListener\s*\(\s*['\"]message['\"]" --type js --type ts -n

# Find event.data usage
rg "event\.data|e\.data" --type js --type ts -n
```

### Web Storage
```javascript
localStorage.getItem('key');
sessionStorage.getItem('key');
```

### Detection Commands
```bash
# Find storage reads
echo "=== Storage sources ==="
rg "localStorage\.getItem" --type js --type ts -n
rg "sessionStorage\.getItem" --type js --type ts -n
```

## DOM XSS Sinks

### HTML Injection Sinks
```javascript
// Direct HTML sinks
element.innerHTML = source;
element.outerHTML = source;
document.write(source);
document.writeln(source);
element.insertAdjacentHTML('beforeend', source);

// jQuery
$(element).html(source);
```

### Detection Commands
```bash
# Find HTML sinks
echo "=== HTML sinks ==="
rg "\.innerHTML\s*=" --type js --type ts -n
rg "\.outerHTML\s*=" --type js --type ts -n
rg "document\.write\s*\(" --type js --type ts -n
rg "insertAdjacentHTML" --type js --type ts -n
```

### JavaScript Execution Sinks
```javascript
eval(source);
setTimeout(source, delay);     // String argument
setInterval(source, delay);    // String argument
Function(source)();
```

### Detection Commands
```bash
# Find JS execution sinks
echo "=== JS execution sinks ==="
rg "\beval\s*\(" --type js --type ts -n
rg "setTimeout\s*\([^,)]+\)" --type js --type ts -n
rg "setInterval\s*\([^,)]+\)" --type js --type ts -n
rg "new\s+Function\s*\(" --type js --type ts -n
```

### Navigation Sinks
```javascript
location = source;
location.href = source;
location.replace(source);
location.assign(source);
window.open(source);
```

### Detection Commands
```bash
# Find navigation sinks
echo "=== Navigation sinks ==="
rg "location\s*=|location\.href\s*=" --type js --type ts -n
rg "location\.replace\s*\(|location\.assign\s*\(" --type js --type ts -n
rg "window\.open\s*\(" --type js --type ts -n
```

## Taint Analysis

### Simple Taint Flow
```javascript
// Source
const hash = location.hash.substring(1);

// Propagation
const decoded = decodeURIComponent(hash);
const html = '<div>' + decoded + '</div>';

// Sink - VULNERABLE!
document.body.innerHTML = html;
```

### Detection Approach
```bash
# Find files with both sources and sinks
echo "=== Files with DOM XSS potential ==="
for file in $(rg "location\.(hash|search|href)|document\.referrer|window\.name" --type js --type ts -l); do
    if rg -q "\.innerHTML\s*=|\.outerHTML\s*=|document\.write|eval\s*\(" "$file"; then
        echo "POTENTIAL DOM XSS: $file"
    fi
done
```

## postMessage Vulnerabilities

### Missing Origin Check
```javascript
// VULNERABLE - No origin validation
window.addEventListener('message', (e) => {
  document.body.innerHTML = e.data;  // XSS from any origin!
});
```

### Weak Origin Check
```javascript
// BYPASSABLE - String comparison
window.addEventListener('message', (e) => {
  if (e.origin.indexOf('trusted.com') !== -1) {  // Bypass: attackertrusted.com
    document.body.innerHTML = e.data;
  }
});
```

### Detection Commands
```bash
# Find postMessage handlers missing obvious inline origin checks (review candidates)
echo "=== postMessage review candidates: no obvious inline origin check ==="
for file in $(rg "addEventListener\s*\(\s*['\"]message['\"]" --type js --type ts -l); do
    if ! rg -q "origin\s*===|origin\s*==" "$file"; then
        echo "REVIEW: $file (may validate origin in helper code)"
    fi
done

# Find weak origin checks (indexOf/includes review)
rg "origin\.indexOf|origin\.includes" --type js --type ts -n
```

## Hash-based DOM XSS

### Common Patterns
```javascript
// VULNERABLE - Hash used directly
function render() {
  const content = location.hash.slice(1);
  document.getElementById('content').innerHTML = content;
}
window.addEventListener('hashchange', render);
```

### Detection Commands
```bash
# Find hash routing with innerHTML
echo "=== Hash routing with innerHTML ==="
rg "location\.hash.*slice\(|location\.hash.*substr" --type js --type ts -n

# Check same file for innerHTML
for file in $(rg "location\.hash" --type js --type ts -l); do
    if rg -q "\.innerHTML\s*=" "$file"; then
        echo "REVIEW: $file"
    fi
done
```

## localStorage/sessionStorage DOM XSS

### Storage-based XSS
```javascript
// VULNERABLE - Reading from storage into DOM
function displayUserContent() {
  const html = localStorage.getItem('userHtml');
  document.body.innerHTML = html;  // XSS if attacker controls storage
}
```

### Detection Commands
```bash
# Find storage reads with innerHTML
echo "=== Storage with innerHTML ==="
for file in $(rg "localStorage\.getItem|sessionStorage\.getItem" --type js --type ts -l); do
    if rg -q "\.innerHTML\s*=|\.outerHTML\s*=" "$file"; then
        echo "POTENTIAL STORAGE XSS: $file"
    fi
done
```

## jQuery Specific

### Vulnerable jQuery Patterns
```javascript
// VULNERABLE - jQuery html()
$('#element').html(location.hash.substring(1));

// VULNERABLE - jQuery attribute with script
$('<div>').attr('onclick', location.hash.substring(1));
```

### Detection Commands
```bash
# Find jQuery html() with variables
echo "=== jQuery html() usage ==="
rg "\.html\s*\([^)'\"\`]+\)" --type js --type ts -n | rg -v "html\s*\(\s*['\"\`]"

# Find jQuery with location
for file in $(rg "location\.(hash|search)" --type js --type ts -l); do
    if rg -q "\.html\s*\(|\.append\s*\(" "$file"; then
        echo "REVIEW: $file"
    fi
done
```

## Framework Router Vulnerabilities

### React Router
```javascript
// VULNERABLE - Using location in dangerouslySetInnerHTML
import { useLocation } from 'react-router-dom';

function SearchPage() {
  const location = useLocation();
  return <div dangerouslySetInnerHTML={{ __html: location.search }} />;
}
```

### Next.js Router
```javascript
// VULNERABLE - useRouter query in dangerous sink
import { useRouter } from 'next/router';

function Page() {
  const router = useRouter();
  const { q } = router.query;
  
  useEffect(() => {
    document.body.innerHTML = q;  // DOM XSS!
  }, [q]);
}
```

### Detection Commands
```bash
# Find useRouter with innerHTML
echo "=== Next.js router XSS ==="
for file in $(rg "useRouter|useLocation" --type jsx --type tsx --type js --type ts -l); do
    if rg -q "\.innerHTML\s*=|\.outerHTML\s*=" "$file"; then
        echo "POTENTIAL ROUTER XSS: $file"
    fi
done
```

## Detection Checklist Commands

### Source Identification
```bash
# Find all DOM XSS sources
echo "=== DOM XSS Sources ==="
echo "location.hash:"
rg "location\.hash" --type js --type ts -l
echo "location.search:"
rg "location\.search" --type js --type ts -l
echo "document.referrer:"
rg "document\.referrer" --type js --type ts -l
echo "window.name:"
rg "window\.name" --type js --type ts -l
echo "postMessage:"
rg "addEventListener\s*\(\s*['\"]message['\"]" --type js --type ts -l
echo "localStorage:"
rg "localStorage\.getItem" --type js --type ts -l
```

### Sink Identification
```bash
# Find all DOM XSS sinks
echo "=== DOM XSS Sinks ==="
echo "innerHTML:"
rg "\.innerHTML\s*=" --type js --type ts -l
echo "document.write:"
rg "document\.write\s*\(" --type js --type ts -l
echo "eval:"
rg "\beval\s*\(" --type js --type ts -l
echo "location navigation:"
rg "location\.href\s*=|location\s*=\s*[^.]|window\.open" --type js --type ts -l
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [OWASP DOM XSS](https://owasp.org/www-community/attacks/DOM_Based_XSS)
- [DOM XSS Sources](https://portswigger.net/web-security/cross-site-scripting/dom-based#sources)
- [postMessage Security](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns)

## Testing Playbook (curl + browser)

### curl
```bash
# Reflected input probe in query/hash-driven pages
curl -i "https://target.tld/search?q=%3Csvg%20onload%3Dalert(1)%3E"
```

### Browser / agent-browser
1. Test URL/hash/query-controlled routes with harmless DOM XSS probes.
2. Observe sinks in runtime via DevTools (`innerHTML`, `document.write`, `eval`).
3. Validate `postMessage` origin checks by sending crafted messages from another origin.
