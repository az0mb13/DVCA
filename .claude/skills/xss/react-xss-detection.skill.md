---
id: react-xss-detection
name: React XSS Detection (Code Scanning)
version: 1.0.0
domain: xss
tags: [xss, react, jsx, code-scanning]
tools_required: [grep, rg]
agent_scope: [specialist/xss, specialist/frontend]
confidence: high
source: internal
created_by: skill-forge
created_at: 2026-03-05
---

## Overview

Detect XSS vulnerabilities in React applications through code scanning.

## Dangerous Patterns

### dangerouslySetInnerHTML
```jsx
// DANGEROUS - Direct XSS vulnerability
function UserContent({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// DANGEROUS - With user input
function Comment({ userComment }) {
  return <div dangerouslySetInnerHTML={{ __html: userComment }} />;
}

// DANGEROUS - API response
function Article({ data }) {
  return <div dangerouslySetInnerHTML={{ __html: data.content }} />;
}
```

### Detection Commands
```bash
# Find dangerouslySetInnerHTML usage
rg "dangerouslySetInnerHTML" --type jsx --type tsx --type js --type ts -n

# Find with variable (not string literal)
rg "dangerouslySetInnerHTML.*\{\s*__html:\s*[^'\"\`]" --type jsx --type tsx -n

# Find with props/data
rg "dangerouslySetInnerHTML.*props\.|dangerouslySetInnerHTML.*data\." --type jsx --type tsx -n
```

### href/src with User Input
```jsx
// DANGEROUS - javascript: protocol
function LinkComponent({ userUrl }) {
  return <a href={userUrl}>Click</a>;
}

// DANGEROUS - javascript: in src
function ImageComponent({ userSrc }) {
  return <img src={userSrc} />;
}

// DANGEROUS - Form action
function FormComponent({ action }) {
  return <form action={action}>...</form>;
}
```

### Detection Commands
```bash
# Find dynamic href
rg "href=\{[^'\"\`].*\}" --type jsx --type tsx -n

# Find dynamic src
rg "src=\{[^'\"\`].*\}" --type jsx --type tsx -n | rg -v "src=\{require"

# Find dynamic action
rg "action=\{[^'\"\`].*\}" --type jsx --type tsx -n
```

### Template Literals with HTML
```jsx
// Bypass attempt - Using dangerouslySetInnerHTML with template
function UnsafeBio({ user }) {
  return <div dangerouslySetInnerHTML={{ 
    __html: `<b>${user.bio}</b>` 
  }} />;  // DANGEROUS!
}
```

### Detection Commands
```bash
# Find template literals in dangerouslySetInnerHTML
rg "dangerouslySetInnerHTML.*\`" --type jsx --type tsx -n
rg "dangerouslySetInnerHTML.*\$\{" --type jsx --type tsx -n
```

## Next.js Specific

### getServerSideProps / getStaticProps
```jsx
// DANGEROUS - Server-side XSS
export async function getServerSideProps({ query }) {
  return {
    props: {
      // This could contain XSS payload
      content: query.html  
    }
  };
}

function Page({ content }) {
  // If rendered unsafely, XSS executes
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### Detection Commands
```bash
# Find getServerSideProps with query params
rg "getServerSideProps.*query" --type jsx --type tsx -A 10

# Find props from query going to dangerouslySetInnerHTML
rg "getServerSideProps|getStaticProps" --type jsx --type tsx -l | \
  xargs rg -l "dangerouslySetInnerHTML"
```

### API Routes
```jsx
// pages/api/data.js
// DANGEROUS - Reflected XSS potential
export default function handler(req, res) {
  const { callback } = req.query;
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`${callback}({ data: 'test' })`);  // JSONP-like vulnerability
}
```

### Detection Commands
```bash
# Find API routes with callback parameter
rg "req\.query\.callback" --type js --type ts -n
rg "res\.send.*callback" --type js --type ts -n
```

## React Router

### Route Parameters
```jsx
// DANGEROUS - Route param in dangerous location
function UserProfile() {
  const { userId } = useParams();
  
  return (
    <div>
      {/* DANGEROUS - if used in href */}
      <a href={userId}>Profile</a>
    </div>
  );
}
```

### useSearchParams
```jsx
import { useSearchParams } from 'react-router-dom';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  // DANGEROUS
  return <div dangerouslySetInnerHTML={{ __html: query }} />;
  
  // SAFE
  return <div>Search: {query}</div>;
}
```

### Detection Commands
```bash
# Find useSearchParams with dangerous usage
rg "useSearchParams" --type jsx --type tsx -l | \
  xargs rg -l "dangerouslySetInnerHTML"

# Find useParams in href/src
rg "useParams" --type jsx --type tsx -A 5 | rg "href=\{|src=\{"
```

## Third-Party Library Risks

### HTML Parsing Libraries
```jsx
import parse from 'html-react-parser';

// DANGEROUS - Parses HTML without sanitization
function ParsedContent({ html }) {
  return <>{parse(html)}</>;  // XSS if html contains scripts
}
```

### Markdown Rendering
```jsx
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// DANGEROUS - Allows HTML in markdown
function UnsafeMarkdown({ content }) {
  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>;
}
```

### Detection Commands
```bash
# Find html-react-parser usage
rg "html-react-parser" --type jsx --type tsx -n
rg "from.*html-react-parser" --type jsx --type tsx -l

# Find rehype-raw usage
rg "rehype-raw" --type jsx --type tsx -n
```

## State Management

### Redux/Global State
```jsx
// DANGEROUS - Storing unsanitized HTML in state
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BIO':
      return { ...state, bio: action.payload };  // Could be XSS payload
  }
};

// Usage - Dangerous
function Profile({ bio }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
```

### localStorage/sessionStorage
```jsx
// DANGEROUS - Reading from storage without sanitization
function StoredContent() {
  const content = localStorage.getItem('userContent');
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### Detection Commands
```bash
# Find localStorage with dangerouslySetInnerHTML
rg "localStorage\.getItem" --type jsx --type tsx -l | \
  xargs rg -l "dangerouslySetInnerHTML"

# Find sessionStorage with dangerouslySetInnerHTML
rg "sessionStorage\.getItem" --type jsx --type tsx -l | \
  xargs rg -l "dangerouslySetInnerHTML"
```

## Detection Checklist

### Code Scanning Commands
```bash
# 1. Search for dangerouslySetInnerHTML usage
echo "=== dangerouslySetInnerHTML usage ==="
rg "dangerouslySetInnerHTML" --type jsx --type tsx --type js --type ts -n

# 2. Check for variable input (not string literals)
echo "=== Variable input to dangerouslySetInnerHTML ==="
rg "dangerouslySetInnerHTML.*\{\s*__html:\s*[a-zA-Z_$]" --type jsx --type tsx -n

# 3. Search for dynamic href/src/action
echo "=== Dynamic URLs ==="
rg "(href|src|action)=\{[^'\"\`]" --type jsx --type tsx -n

# 4. Check for html-react-parser
echo "=== HTML parsing libraries ==="
rg "html-react-parser" --type jsx --type tsx -n

# 5. Check for storage + dangerousSetInnerHTML combination
echo "=== Storage with dangerous patterns ==="
for file in $(rg "localStorage|sessionStorage" --type jsx --type tsx -l); do
    if rg -q "dangerouslySetInnerHTML" "$file"; then
        echo "$file"
    fi
done
```

## Evidence Checklist

- Capture exact request and response evidence.
- Capture reproducible steps and required prerequisites.
- Capture affected roles, objects, and business impact.


## References

- [React XSS Prevention](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks)
- [dangerouslySetInnerHTML Documentation](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Testing Playbook (curl + browser)

### curl
```bash
# Probe API response fields that are rendered in React
curl -i "https://target.tld/api/content?id=1"
```

### Browser / agent-browser
1. Feed controlled payloads into fields rendered by React components.
2. Inspect components using `dangerouslySetInnerHTML` and third-party HTML parsers.
3. Verify payload is escaped or sanitized and scripts do not execute.
