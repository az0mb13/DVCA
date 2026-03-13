---
id: template-engine-xss
name: Template Engine XSS Detection
version: 1.0.0
domain: xss
tags: [xss, templates, static-analysis, engines]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/sast]
confidence: high
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect XSS vulnerabilities in server-side template engines. Template engines auto-escape by default in modern frameworks, but unsafe directives and misconfigurations can introduce XSS.

## Django Templates

### Unsafe Patterns
```django
<!-- SAFE - Auto-escaped -->
{{ user_input }}

<!-- DANGEROUS - Explicit unescape -->
{{ user_input|safe }}

<!-- DANGEROUS - From Python -->
{{ html_content|safe }}

<!-- DANGEROUS - autoescape off -->
{% autoescape off %}
  {{ user_input }}
{% endautoescape %}
```

### Python Code Patterns
```python
# DANGEROUS - mark_safe
from django.utils.safestring import mark_safe
def view(request):
    return render(request, 'template.html', {
        'content': mark_safe(request.GET['html'])
    })

# DANGEROUS - format_html with variable
from django.utils.html import format_html
def view(request):
    return render(request, 'template.html', {
        'content': format_html(request.GET['html'])
    })
```

### Detection Commands
```bash
# Find |safe filter in templates
rg "\{\{.*\|safe\s*\}\}" --type html -n

# Find autoescape off
rg "autoescape\s+off" --type html -n

# Find mark_safe in Python
rg "mark_safe\s*\(" --type py -n

# Find format_html with user input
rg "format_html\s*\(\s*request" --type py -n
```

## Jinja2 (Flask/FastAPI)

### Unsafe Patterns
```jinja2
<!-- SAFE - Auto-escaped -->
{{ user_input }}

<!-- DANGEROUS - Explicit unescape -->
{{ user_input|safe }}
{{ user_input|striptags }}

<!-- DANGEROUS - Raw block -->
{% raw %}
  {{ user_input }}
{% endraw %}
```

### Python Code Patterns
```python
# DANGEROUS - Markup
from jinja2 import Markup
def view():
    return render_template('page.html', 
        content=Markup(request.args.get('html')))

# DANGEROUS - Environment settings
env = Environment(autoescape=False)  # NEVER do this
```

### Detection Commands
```bash
# Find |safe filter
rg "\{\{.*\|safe" --type html --type jinja2 -n

# Find Markup usage
rg "Markup\s*\(" --type py -n

# Find autoescape disabled
rg "autoescape\s*=\s*False" --type py -n
```

## Handlebars/Mustache

### Unsafe Patterns
```handlebars
<!-- SAFE - HTML-escaped -->
{{userInput}}

<!-- DANGEROUS - Triple stash (raw HTML) -->
{{{userInput}}}
{{&userInput}}
```

### JavaScript Patterns
```javascript
// DANGEROUS - SafeString
Handlebars.SafeString(userInput)
```

### Detection Commands
```bash
# Find triple stash
rg "\{\{\{[^}]+\}\}\}" --type hbs --type handlebars -n

# Find ampersand unescape
rg "\{\{&[^}]+\}\}" --type hbs --type handlebars -n

# Find SafeString
rg "SafeString\s*\(" --type js --type ts -n
```

## EJS (Embedded JavaScript)

### Unsafe Patterns
```ejs
<!-- SAFE - Escaped output -->
<%= userInput %>

<!-- DANGEROUS - Unescaped output -->
<%- userInput %>
```

### Express.js Patterns
```javascript
// DANGEROUS - Unescaped by default in older versions
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('page', { 
    html: req.query.html  // If template uses <%- %>
  });
});
```

### Detection Commands
```bash
# Find <%- (unescaped)
rg "<%-\s*" --type ejs -n

# Find in template files
rg "<%-\s*[a-zA-Z_$]" --type html -n
```

## Pug (Jade)

### Unsafe Patterns
```pug
// SAFE - Escaped
p= userInput
div #{userInput}

// DANGEROUS - Unescaped
p!= userInput
div !{userInput}
```

### Detection Commands
```bash
# Find unescaped output
rg "!=\s*[a-zA-Z_$]" --type pug --type jade -n
rg "!\{[^}]+\}" --type pug --type jade -n
```

## Thymeleaf (Java)

### Unsafe Patterns
```html
<!-- SAFE - Escaped -->
<div th:text="${userInput}"></div>

<!-- DANGEROUS - Unescaped -->
<div th:utext="${userInput}"></div>

<!-- DANGEROUS - Inline expression -->
<div>[(${userInput})]</div>  <!-- Unescaped -->
<div>[[${userInput}]]</div>  <!-- Escaped -->
```

### Detection Commands
```bash
# Find th:utext
rg "th:utext" --type html -n

# Find unescaped inline
rg "\[\(\$\{[^}]+\}\)\]" --type html -n
```

## Velocity (Java)

### Unsafe Patterns
```velocity
## SAFE - Escaped (depending on config)
$userInput

## DANGEROUS - Unescaped
$!userInput
$!{userInput}
```

### Detection Commands
```bash
# Find unescaped references
rg "\$!\{[^}]+\}" --type vm --type vtl -n
rg "\$![a-zA-Z]" --type vm --type vtl -n
```

## Smarty (PHP)

### Unsafe Patterns
```smarty
{* SAFE - Escaped *}
{$userInput}

{* DANGEROUS - Unescaped *}
{$userInput nofilter}
{$userInput|unescape}
```

### Detection Commands
```bash
# Find nofilter
rg "\{\$[^}]+nofilter\}" --type tpl -n

# Find unescape modifier
rg "\|unescape" --type tpl -n
```

## Go Templates

### Safe vs Unsafe
```go
// html/template - SAFE (escapes by default)
import "html/template"

// text/template - UNSAFE
import "text/template"  // Wrong for HTML output
```

### Detection Commands
```bash
# Find text/template for HTML
rg "text/template" --type go -n | rg -v "_test.go"

# Check if used for web responses
for file in $(rg "text/template" --type go -l); do
    if rg -q "http.ResponseWriter|ResponseWriter" "$file"; then
        echo "POTENTIAL XSS: $file uses text/template for HTTP"
    fi
done
```

## Detection by File Extension

### Scan Commands
```bash
# Django templates
rg "\|safe|autoescape\s+off" --type html -n

# Jinja2
rg "\|safe|autoescape\s*=\s*False" --type html --type jinja2 -n

# Handlebars
rg "\{\{\{|\{\{&" --type hbs --type handlebars -n

# EJS
rg "<%-[^=]" --type ejs -n

# Pug/Jade
rg "!=\s+\w|!\{" --type pug --type jade -n

# Thymeleaf
rg "th:utext|\[\(" --type html -n

# Velocity
rg "\$!" --type vm --type vtl -n

# Smarty
rg "nofilter\s*\}|\|unescape" --type tpl -n
```

## Configuration Detection

### Express.js (EJS/Pug/Handlebars)
```javascript
// DANGEROUS - Check for custom escape settings
app.set('view engine', 'ejs');
app.locals.escapeMarkup = false;  // If template engine supports it
```

### Django Settings
```python
# settings.py - DANGEROUS
TEMPLATES = [{
    'OPTIONS': {
        'autoescape': False,  # NEVER disable this
    }
}]
```

### Detection Commands
```bash
# Django settings
rg "autoescape.*False" --type py -n

# Express settings
rg "escapeMarkup.*false" --type js -n
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [Django Autoescape](https://docs.djangoproject.com/en/stable/ref/templates/language/#automatic-html-escaping)
- [Jinja2 Security](https://jinja.palletsprojects.com/en/stable/sandbox/)
- [Thymeleaf Documentation](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#unescaped-text)

## Testing Playbook (curl + browser)

### curl
```bash
# Reflected template output probe
curl -i "https://target.tld/page?bio=%7B%7B7*7%7D%7D"
```

### Browser / agent-browser
1. Inject payloads through template-backed fields (comments, bios, profile text).
2. Validate whether unsafe template directives render unescaped HTML.
3. Confirm auto-escaping remains enabled in production paths.
