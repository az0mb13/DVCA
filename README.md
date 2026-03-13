# VulnLab - Deliberately Vulnerable Web Application

> **WARNING: VulnLab is an INTENTIONALLY VULNERABLE application designed for security training and education. It contains numerous real-world vulnerabilities. NEVER deploy this to a production environment, expose it to the internet, or use it outside of isolated lab environments.**

## About

VulnLab is a full-stack deliberately vulnerable web application modeled after OWASP Juice Shop and DVWA. It functions as an e-commerce platform for a fictional company called "VulnCorp" and covers every verification category from the **OWASP Application Security Verification Standard (ASVS) v4.0**.

It features **81 exploitable challenges** across 14 ASVS categories, with difficulty modes (easy/medium/hard) that progressively enable or disable security controls.

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
| admin@vulncorp.com | admin123 | admin |
| john@vulncorp.com | password | user |
| jane@vulncorp.com | 123456 | user |
| bob@vulncorp.com | qwerty | manager |
| test@vulncorp.com | letmein | user |

## Tech Stack

- **Backend:** Node.js + Express.js
- **Frontend:** React (Vite)
- **Database:** SQLite via better-sqlite3 (raw queries)
- **Authentication:** Custom session-based (intentionally flawed)
- **Templating:** EJS (for SSTI vulnerabilities)
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

Visit http://127.0.0.1:3000/scoreboard to:
- View all challenges grouped by ASVS category
- Track completion progress
- Submit discovered flags (format: `FLAG{...}`)
- See hints for each challenge

## Solutions

See [SOLUTIONS.md](SOLUTIONS.md) for step-by-step exploitation walkthroughs for every challenge.

## ASVS Mapping

See [docs/asvs-mapping.md](docs/asvs-mapping.md) for a complete mapping of challenges to ASVS v4.0 requirements.

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
vulnlab/
+-- server/           # Express.js backend
|   +-- routes/       # API routes (each with marked vulnerabilities)
|   +-- middleware/    # Auth, logging, rate limiting
|   +-- utils/        # Crypto, XML parsing
|   +-- db/           # SQLite schema and seed data
|   +-- templates/    # EJS templates (SSTI)
+-- client/           # React frontend (Vite)
+-- scoreboard/       # Challenge definitions and progress tracking
+-- docs/             # ASVS mapping documentation
```

## Legal Disclaimer

This software is provided for **educational and authorized security testing purposes only**. By using VulnLab, you agree to:

1. Only use it in isolated, local environments
2. Never deploy it to production or expose it to the internet
3. Not use the techniques learned to attack systems without explicit authorization
4. Comply with all applicable laws and regulations

The authors are not responsible for any misuse of this software. Use responsibly.

## License

MIT - For educational purposes only.
