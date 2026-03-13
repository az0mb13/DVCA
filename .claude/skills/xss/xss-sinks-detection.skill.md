---
id: xss-sinks-detection
name: XSS Sinks Detection (Code Scanning)
version: 1.0.0
domain: xss
tags: [xss, static-analysis, sinks, code-scanning]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/code-review]
confidence: high
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect XSS vulnerabilities in source code by identifying dangerous sinks (functions/methods that render user input unsafely).

## JavaScript/TypeScript Sinks

### Dangerous DOM Sinks
```javascript
// innerHTML - HIGH RISK
element.innerHTML = userInput;
document.body.innerHTML = req.query.q;
$('#element').html(userData);

// outerHTML - HIGH RISK
element.outerHTML = userInput;

// document.write - HIGH RISK
document.write(userInput);
document.writeln(userInput);

// insertAdjacentHTML - HIGH RISK
element.insertAdjacentHTML('beforeend', userInput);

// Dangerous React patterns
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Detection Commands
```bash
# Find innerHTML assignments with variables
rg "\.innerHTML\s*=" --type js --type ts
rg "\.outerHTML\s*=" --type js --type ts
rg "document\.write\s*\(" --type js --type ts
rg "insertAdjacentHTML" --type js --type ts

# Find React dangerouslySetInnerHTML
rg "dangerouslySetInnerHTML" --type js --type ts --type jsx --type tsx
```

### JavaScript Execution Sinks
```javascript
// eval - CRITICAL
eval(userInput);

// setTimeout/setInterval with string - CRITICAL
setTimeout(userInput, 1000);
setInterval(userInput, 1000);

// Function constructor - CRITICAL
new Function(userInput);
```

### Detection Commands
```bash
# Find eval usage
rg "\beval\s*\(" --type js --type ts

# Find setTimeout/setInterval with potential strings
rg "setTimeout\s*\([^,)]+\)" --type js --type ts
rg "setInterval\s*\([^,)]+\)" --type js --type ts

# Find Function constructor
rg "new\s+Function\s*\(" --type js --type ts
```

## Python Sinks

### Template Engines
```python
# Django - unsafe
from django.utils.safestring import mark_safe
mark_safe(user_input)  # Bypasses escaping

# Jinja2 - unsafe
from jinja2 import Markup
Markup(user_input)  # Bypasses escaping

# Direct HTML output
HttpResponse(user_input)  # Django - unsafe
self.write(user_input)  # Tornado - unsafe
```

### Detection Commands
```bash
# Find mark_safe usage
rg "mark_safe\s*\(" --type py

# Find Markup usage
rg "Markup\s*\(" --type py

# Find direct HttpResponse with request data
rg "HttpResponse\s*\(\s*request" --type py
```

## Java Sinks

### JSP/Thymeleaf
```java
// JSP - unsafe
<%= request.getParameter("input") %>
${param.input}  // EL expression

// Thymeleaf - unsafe (th:utext vs th:text)
<div th:utext="${userInput}"></div>  // unescaped - DANGEROUS
<div th:text="${userInput}"></div>   // escaped - SAFE

// Direct output
out.print(request.getParameter("input"));
response.getWriter().write(userInput);
```

### Detection Commands
```bash
# Find JSP expressions
rg "<%=.*request\.getParameter" --type jsp --type html
rg "\$\{param\." --type jsp --type html

# Find Thymeleaf utext
rg "th:utext" --type html

# Find direct output in Java
rg "out\.print\s*\(\s*request" --type java
rg "getWriter\(\)\.write" --type java
```

## PHP Sinks

### Echo/Print
```php
// Direct output - DANGEROUS
echo $_GET['input'];
print $_POST['data'];
echo $userInput;

// Short tags - DANGEROUS
<?= $_GET['input'] ?>

// Inside HTML attributes
<div class="<?php echo $_GET['class']; ?>">
```

### Detection Commands
```bash
# Find direct echo of user input
rg "echo\s*\$_" --type php
rg "print\s*\$_" --type php

# Find short tags
rg "<\?=\s*\$_" --type php

# Find echo in HTML attributes
rg 'echo\s*\$_GET\[' --type php
```

## Ruby Sinks

### ERB Templates
```ruby
# ERB - unsafe
<%= raw @user_input %>
<%= @user_input.html_safe %>
<%= @user_input.to_s.html_safe %>

# Safe alternatives
<%= h @user_input %>
<%= @user_input %>
```

### Rails
```ruby
# Controller - unsafe
render html: params[:input]
render inline: params[:template]
```

### Detection Commands
```bash
# Find raw helper usage
rg "<%=\s+raw\s+" --type erb

# Find html_safe usage
rg "\.html_safe" --type rb --type erb

# Find render with user params
rg "render\s+html:\s*params" --type rb
```

## Go Sinks

### Templates
```go
// html/template - SAFE (auto-escapes)
tmpl, _ := template.New("test").Parse("Hello {{.Name}}")

// text/template - UNSAFE
tmpl, _ := textTemplate.New("test").Parse("Hello {{.Name}}")

// Direct write
w.Write([]byte(r.URL.Query().Get("input")));
fmt.Fprint(w, userInput);
```

### Detection Commands
```bash
# Find text/template usage for HTML
rg "text/template" --type go | rg -v "_test.go"

# Find direct response writes with URL params
rg "Query\(\)\.Get" --type go
rg "Write\s*\(\s*\[\]byte.*r\.URL" --type go
```

## Sources (User Input)

### HTTP Request Data
```javascript
// Express.js
req.query.parameter
req.body.field
req.params.id
req.headers['x-custom']
req.cookies.name

// Location objects
location.hash
location.search
location.href
document.URL
document.referrer
window.name
```

### Detection Commands
```bash
# Find Express request usage
rg "req\.query\." --type js --type ts
rg "req\.body\." --type js --type ts
rg "req\.params\." --type js --type ts

# Find location-based sources
rg "location\.hash" --type js --type ts
rg "location\.search" --type js --type ts
rg "document\.referrer" --type js --type ts
rg "window\.name" --type js --type ts
```

## Data Flow Analysis

### Taint Flow Example
```javascript
// Source
const name = req.query.name;

// Intermediate processing (taint propagates)
const displayName = name.toUpperCase();
const html = `<div>${displayName}</div>`;

// Sink (vulnerability)
element.innerHTML = html;  // XSS!
```

### Detection Approach
```bash
# 1. Find all sources
echo "=== Sources ==="
rg "req\.query|req\.body|req\.params" --type js -l

# 2. Find all sinks
echo "=== Sinks ==="
rg "\.innerHTML\s*=|\.outerHTML\s*=|document\.write" --type js -l

# 3. Find files with both (potential vulnerabilities)
echo "=== Files with both sources and sinks ==="
for file in $(rg "req\.query|req\.body" --type js -l); do
    if rg -q "\.innerHTML\s*=|\.outerHTML\s*=" "$file"; then
        echo "$file"
    fi
done
```

## Verification Steps

### Step 1: Identify Sources
```bash
# JavaScript
rg "req\.(query|body|params)|location\.(hash|search)" --type js --type ts -n

# Python
rg "request\.(GET|POST|args|form)" --type py -n

# PHP
rg "\$_(GET|POST|REQUEST)" --type php -n
```

### Step 2: Identify Sinks
```bash
# All languages - common patterns
rg "(innerHTML|outerHTML)\s*=" -n
echo "<script>" | rg -i "document\.write|eval\s*\("
```

### Step 3: Check for Sanitization
```bash
# Look for sanitization libraries
rg "(DOMPurify|sanitize|escape|htmlspecialchars|bleach\.clean)" -n

# Check if sanitization is applied before sink
# Manual review required - look for patterns like:
# element.innerHTML = sanitize(userInput)
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [CWE-79: XSS](https://cwe.mitre.org/data/definitions/79.html)

## Testing Playbook (curl + browser)

### curl
```bash
# Probe endpoints whose data reaches identified sinks
curl -i "https://target.tld/api/profile?name=%3Csvg%20onload%3Dalert(1)%3E"
```

### Browser / agent-browser
1. Trace source-to-sink path in DevTools and runtime behavior.
2. Confirm whether sink receives encoded, sanitized, or raw attacker-controlled data.
3. Validate script execution is blocked in affected view/component.
