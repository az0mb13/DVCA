# DVCA - Damn Vulnerable Credshields Application

## About

DVCA is a full-stack e-commerce web application covering every verification category from the **OWASP Application Security Verification Standard (ASVS) v4.0**. It features **81 challenges** across 14 ASVS categories, with difficulty modes (easy/medium/hard) that progressively enable or disable security controls.

## Prerequisites

- Docker & Docker Compose OR Node.js 18+
- A modern web browser with developer tools

## Quick Start

### Docker (Recommended)
```bash
docker-compose up
```
Access the application at: http://127.0.0.1:3000

### Manual Setup
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Initialize database
npm run setup

# Build client
npm run build:client

# Start server
npm start
```

### Development Mode
```bash
npm run dev
```
This runs both the Express server (port 3000) and Vite dev server (port 5173) concurrently.

## Default Credentials

| Email | Password | Role |
|---|---|---|
| admin@dvca.com | admin123 | admin |
| john@dvca.com | password | user |
| jane@dvca.com | 123456 | user |
| bob@dvca.com | qwerty | manager |
| test@dvca.com | letmein | user |

## Tech Stack

- **Backend:** Node.js + Express.js
- **Frontend:** React (Vite)
- **Database:** SQLite via better-sqlite3 (raw queries)
- **Authentication:** Custom session-based
- **Templating:** EJS
- **API:** REST + GraphQL

## ASVS Category Coverage

| Category | Challenges | Description |
|---|---|---|
| V1 - Architecture | 1 | Hidden debug endpoint, no security boundaries |
| V2 - Authentication | 8 | MD5 passwords, brute force, 2FA bypass, enumeration |
| V3 - Session Management | 5 | Sequential sessions, no invalidation, forgeable tokens |
| V4 - Access Control | 6 | IDOR, client-side auth, role escalation |
| V5 - Validation | 10 | SQLi, XSS, XXE, SSTI, deserialization, memory leak |
| V6 - Cryptography | 7 | MD5, DES, Math.random(), hardcoded secrets |
| V7 - Error Handling | 5 | Log exposure, injection, verbose errors |
| V8 - Data Protection | 5 | PII exposure, localStorage tokens, no cache control |
| V9 - Communication | 4 | CORS wildcard, no HTTPS, SSRF |
| V10 - Malicious Code | 4 | Vulnerable deps, eval(), backdoor, no SRI |
| V11 - Business Logic | 5 | Coupon stacking, self-referral, race conditions |
| V12 - Files | 5 | Path traversal, web shells, no validation |
| V13 - API | 5 | Mass assignment, GraphQL introspection, HTTP method abuse |
| V14 - Configuration | 11 | Git exposure, missing headers, debug mode, CSRF |

**Total: 81 challenges**

## Scoreboard

The challenge scoreboard is a separate application. See [scoreboard-app/](scoreboard-app/) for setup instructions.

```bash
cd scoreboard-app && npm install && npm start
```

Access at http://127.0.0.1:4000

## Difficulty Modes

Toggle difficulty via the Admin Dashboard or API:
```bash
curl -X POST http://127.0.0.1:3000/api/config/difficulty \
  -H 'Content-Type: application/json' \
  -d '{"difficulty": "medium"}'
```

| Feature | Easy | Medium | Hard |
|---|---|---|---|
| SQL Injection | String concat, verbose errors | Parameterized with bypass | Blind SQLi only |
| XSS | No encoding | Basic filter | CSP (misconfigured) |
| Auth | No rate limit | Rate limit (bypassable via XFF) | Rate limit + lockout (bypassable) |
| Access Control | No checks | Role check via parameter | Role check + weak HMAC |
| File Upload | No validation | Extension blacklist | Blacklist + magic bytes (bypassable) |

## Project Structure

```
dvca/
├── server/              # Express.js backend
│   ├── routes/          # API routes
│   ├── middleware/       # Auth, logging, rate limiting
│   ├── utils/           # Crypto, XML parsing
│   ├── db/              # SQLite schema and seed data
│   └── templates/       # EJS templates
├── client/              # React frontend (Vite)
├── scoreboard-app/      # Standalone challenge scoreboard
├── scoreboard/          # Challenge definitions and progress tracking
└── docs/                # ASVS mapping documentation
```

## License

MIT
