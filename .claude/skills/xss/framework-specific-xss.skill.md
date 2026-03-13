---
id: framework-specific-xss
name: Framework-Specific XSS Detection
version: 1.0.0
domain: xss
tags: [xss, frameworks, static-analysis, django, rails, laravel, express]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/sast]
confidence: high
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Framework-specific XSS detection patterns for popular web frameworks using basic code scanning tools.

## Django

### Unsafe Patterns
```python
# views.py
from django.utils.safestring import mark_safe
from django.http import HttpResponse

def unsafe_view(request):
    user_input = request.GET.get('html', '')
    
    # DANGEROUS - mark_safe with user input
    return HttpResponse(mark_safe(user_input))
```

### Template Unsafe Patterns
```django
<!-- DANGEROUS - Template with |safe filter -->
{{ user_input|safe }}

<!-- DANGEROUS - autoescape off -->
{% autoescape off %}{{ user_input }}{% endautoescape %}
```

### Detection Commands
```bash
# Find mark_safe with request data
rg "mark_safe\s*\(\s*request" --type py -n
rg "mark_safe\s*\(.*GET|mark_safe\s*\(.*POST" --type py -n

# Find |safe filter
rg "\{\{.*\|safe\s*\}\}" --type html -n

# Find autoescape off
rg "autoescape\s+off" --type html -n
```

## Flask

### Unsafe Patterns
```python
from flask import Markup

@app.route('/unsafe')
def unsafe():
    # DANGEROUS - Markup class
    html = request.args.get('html', '')
    return Markup(html)
```

### Detection Commands
```bash
# Find Markup usage with request
rg "Markup\s*\(\s*request" --type py -n
rg "Markup\s*\(.*args\|Markup\s*\(.*form" --type py -n
```

## Express.js

### Unsafe Patterns
```javascript
const express = require('express');
const app = express();

// DANGEROUS - Direct response write
app.get('/unsafe', (req, res) => {
  res.send(req.query.html);  // XSS
});

// DANGEROUS - EJS with unescaped output
// template.ejs: <%- html %>
```

### Detection Commands
```bash
# Find direct response with user input
rg "res\.send\s*\(\s*req\." --type js -n
rg "res\.write\s*\(\s*req\." --type js -n

# Find EJS unescaped output
rg "<%-[^=]" --type ejs -n
rg "<%-\s*\w+" --type html -n
```

## Ruby on Rails

### Unsafe Patterns
```ruby
# View
<%= raw @user_input %>
<%= @user_input.html_safe %>

# Controller
render html: params[:html]
render inline: params[:template]
```

### Detection Commands
```bash
# Find raw helper
rg "<%=\s+raw\s+" --type erb -n

# Find html_safe
rg "\.html_safe" --type rb --type erb -n

# Find render with params
rg "render\s+html:\s*params" --type rb -n
rg "render\s+inline:\s*params" --type rb -n
```

## Laravel (PHP)

### Unsafe Patterns
```php
// Blade templates
{!! $user_input !!}

// Controller
return view('profile', ['html' => request('html')]);
```

### Detection Commands
```bash
# Find unescaped Blade output
rg "\{!!\s*\$[^}]+\s*!!\}" --type blade.php -n

# Find direct request in view data
rg "request\s*\(\s*['\"]" --type php -n
```

## Spring Boot (Java)

### Unsafe Patterns
```java
// Thymeleaf
<div th:utext="${userInput}"></div>

// JSP
<%= request.getParameter("input") %>
```

### Detection Commands
```bash
# Find Thymeleaf utext
rg "th:utext" --type html -n

# Find JSP expressions
rg "<%=.*request\.getParameter" --type jsp -n
rg "\$\{param\." --type jsp --type html -n
```

## ASP.NET

### Unsafe Patterns
```csharp
// Razor
@Html.Raw(Model.UserContent)

// WebForms
<%= Request.QueryString["html"] %>
```

### Detection Commands
```bash
# Find Html.Raw
rg "Html\.Raw\s*\(" --type cshtml --type html -n

# Find unescaped output
rg "<%=.*Request\." --type aspx -n
```

## FastAPI

### Unsafe Patterns
```python
from fastapi.responses import HTMLResponse

@app.get("/direct")
async def direct(html: str):
    return HTMLResponse(content=html)
```

### Detection Commands
```bash
# Find HTMLResponse with user input
rg "HTMLResponse.*request\|HTMLResponse.*query" --type py -n
```

## Sinatra (Ruby)

### Unsafe Patterns
```ruby
get '/unsafe' do
  erb "<div>#{params[:html]}</div>"  # String interpolation
end
```

### Detection Commands
```bash
# Find inline templates with params
rg "erb\s+['\"].*#\{params" --type rb -n
rg "erb\s+['\"].*#\{@" --type rb -n
```

## Framework Detection

### Detect Framework
```bash
# Detect framework type
echo "=== Detecting frameworks ==="
echo "Django:"
find . -name "settings.py" -o -name "wsgi.py" 2>/dev/null | head -5
echo "Flask:"
rg "from flask import" --type py -l | head -5
echo "Express:"
find . -name "package.json" -exec grep -l "express" {} \; 2>/dev/null | head -5
echo "Rails:"
find . -name "Gemfile" -exec grep -l "rails" {} \; 2>/dev/null | head -5
echo "Laravel:"
find . -name "composer.json" -exec grep -l "laravel" {} \; 2>/dev/null | head -5
echo "Spring Boot:"
find . -name "pom.xml" -exec grep -l "spring-boot" {} \; 2>/dev/null | head -5
```

## Pattern Scanning by Framework

### Django
```bash
echo "=== Django XSS patterns ==="
rg "mark_safe" --type py -n
rg "\|safe" --type html -n
rg "autoescape\s+off" --type html -n
```

### Rails
```bash
echo "=== Rails XSS patterns ==="
rg "\.html_safe" --type rb --type erb -n
rg "<%=\s+raw\s+" --type erb -n
rg "render\s+html:\s*params\|render\s+inline:" --type rb -n
```

### Laravel
```bash
echo "=== Laravel XSS patterns ==="
rg "\{!!" --type blade.php -n
rg "@php.*echo" --type blade.php -n
```

### Express
```bash
echo "=== Express XSS patterns ==="
rg "res\.send\s*\(\s*req\.\|res\.write\s*\(\s*req\." --type js -n
rg "<%-" --type ejs -n
```

## Evidence Checklist

- Capture framework name, file, line, and unsafe rendering primitive.
- Capture payload and exact route or view that renders attacker-controlled input.
- Capture proof of execution or unsafe render behavior in browser runtime.


## References

- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/#cross-site-scripting-xss-protection)
- [Rails Security Guide](https://guides.rubyonrails.org/security.html#cross-site-scripting-xss)
- [Laravel Security](https://laravel.com/docs/master/blade#displaying-data)

## Testing Playbook (curl + browser)

### curl
```bash
# Generic reflected endpoint check across framework routes
curl -i "https://target.tld/profile?name=%3Cimg%20src=x%20onerror=alert(1)%3E"
```

### Browser / agent-browser
1. Execute framework-specific UI flows (forms/comments/profile fields).
2. Inject payloads into stored/reflected surfaces and verify render context.
3. Confirm unsafe template directives (`safe`, `raw`, triple-stash) are not reachable with untrusted data.
