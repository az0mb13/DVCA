# ASVS v4.0 Mapping - VulnLab Challenges

This document maps each VulnLab challenge to its corresponding OWASP ASVS v4.0 requirement.

## V1 - Architecture, Design and Threat Modeling

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V1.1.1 | v1-arch-001 | Hidden Debug Endpoint | 1 |

## V2 - Authentication

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V2.1.1 | v2-auth-001 | Crack the Admin Password | 2 |
| V2.1.2 | v2-auth-007 | No Password Complexity | 1 |
| V2.2.1 | v2-auth-002 | Username Enumeration | 1 |
| V2.2.2 | v2-auth-008 | Brute Force Login | 2 |
| V2.3.1 | v2-auth-003 | Brute Force Reset Code | 2 |
| V2.4.1 | v2-auth-004 | Legacy User Export | 1 |
| V2.5.1 | v2-auth-005 | Security Question Bypass | 2 |
| V2.7.1 | v2-auth-006 | 2FA Bypass | 2 |

## V3 - Session Management

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V3.1.1 | v3-session-001 | Predictable Session IDs | 2 |
| V3.1.2 | v3-session-005 | Session Cookie No HttpOnly | 1 |
| V3.2.1 | v3-session-002 | Session Persists After Password Change | 1 |
| V3.3.1 | v3-session-003 | Session Valid After Logout | 1 |
| V3.4.1 | v3-session-004 | Forge Remember-Me Token | 2 |

## V4 - Access Control

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V4.1.1 | v4-access-001 | Access Admin Dashboard as User | 1 |
| V4.1.2 | v4-access-005 | Client-Side Only Access Control | 1 |
| V4.2.1 | v4-access-002 | IDOR - Modify Another User's Profile | 2 |
| V4.2.2 | v4-access-003 | IDOR - View Other Users' Orders | 1 |
| V4.2.3 | v4-access-006 | View Any Order by ID | 1 |
| V4.3.1 | v4-access-004 | Role Escalation via Request Body | 2 |

## V5 - Validation, Sanitization and Encoding

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V5.1.1 | v5-valid-001 | Negative Quantity Refund | 1 |
| V5.1.2 | v5-valid-009 | Price Override in Checkout | 2 |
| V5.2.1 | v5-valid-002 | SQL Injection in Search | 2 |
| V5.2.2 | v5-valid-003 | Stored XSS in Reviews | 1 |
| V5.2.3 | v5-valid-004 | XXE - XML External Entity Injection | 3 |
| V5.2.4 | v5-valid-005 | Server-Side Template Injection | 3 |
| V5.2.5 | v5-valid-010 | SQL Error Reveals Schema | 1 |
| V5.3.1 | v5-valid-006 | Reflected XSS in Multiple Contexts | 2 |
| V5.4.1 | v5-valid-007 | Memory Disclosure via Buffer.allocUnsafe | 3 |
| V5.5.1 | v5-valid-008 | Insecure Deserialization RCE | 3 |

## V6 - Stored Cryptography

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V6.1.1 | v6-crypto-001 | Plaintext Credit Cards | 1 |
| V6.2.1 | v6-crypto-002 | DES Encryption with Hardcoded Key | 2 |
| V6.2.2 | v6-crypto-003 | Predictable API Tokens | 2 |
| V6.2.3 | v6-crypto-007 | MD5 Password Hashing | 1 |
| V6.3.1 | v6-crypto-004 | Predictable Password Reset Token | 2 |
| V6.4.1 | v6-crypto-005 | Hardcoded JWT Secret | 1 |
| V6.4.2 | v6-crypto-006 | Credentials in Source Files | 1 |

## V7 - Error Handling and Logging

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V7.1.1 | v7-log-001 | Sensitive Data in Logs | 1 |
| V7.1.2 | v7-log-005 | Passwords Logged in Plaintext | 1 |
| V7.2.1 | v7-log-002 | Log Injection | 2 |
| V7.3.1 | v7-log-003 | Logs in Web Root | 1 |
| V7.4.1 | v7-log-004 | Verbose Error Messages | 1 |

## V8 - Data Protection

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V8.1.1 | v8-data-001 | Server Technology Disclosure | 1 |
| V8.1.2 | v8-data-005 | No Cache-Control Headers | 1 |
| V8.2.1 | v8-data-002 | Auth Tokens in localStorage | 1 |
| V8.2.2 | v8-data-004 | Search History in Cookie | 1 |
| V8.3.1 | v8-data-003 | Excessive PII in API Responses | 1 |

## V9 - Communication

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V9.1.1 | v9-comm-001 | Overly Permissive CORS | 2 |
| V9.1.2 | v9-comm-004 | No HTTPS Enforcement | 1 |
| V9.2.1 | v9-comm-002 | SSRF via Webhook | 2 |
| V9.2.2 | v9-comm-003 | SSRF Internal Service Access | 3 |

## V10 - Malicious Code

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V10.1.1 | v10-code-001 | Vulnerable Dependency | 1 |
| V10.1.2 | v10-code-002 | Remote Code via Plugin System | 3 |
| V10.2.1 | v10-code-003 | Discover the Backdoor | 2 |
| V10.3.1 | v10-code-004 | No Subresource Integrity | 1 |

## V11 - Business Logic

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V11.1.1 | v11-logic-001 | Coupon Code Stacking | 2 |
| V11.1.2 | v11-logic-002 | Self-Referral Credits | 1 |
| V11.1.3 | v11-logic-003 | Order Replay Attack | 2 |
| V11.1.4 | v11-logic-004 | Race Condition - Buy Last Item Twice | 3 |
| V11.1.5 | v11-logic-005 | Negative Quantity Free Items | 1 |

## V12 - Files and Resources

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V12.1.1 | v12-file-001 | Web Shell Upload | 2 |
| V12.1.2 | v12-file-005 | No File Size Limit | 1 |
| V12.2.1 | v12-file-002 | Path Traversal Upload | 2 |
| V12.3.1 | v12-file-003 | Template Execution via Upload | 2 |
| V12.4.1 | v12-file-004 | Path Traversal Download | 1 |

## V13 - API and Web Service

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V13.1.1 | v13-api-001 | GET Request Deletes Product | 1 |
| V13.2.1 | v13-api-002 | Mass Assignment - Register as Admin | 1 |
| V13.3.1 | v13-api-003 | GraphQL Introspection Data Leak | 2 |
| V13.3.2 | v13-api-004 | GraphQL DoS via Deep Nesting | 2 |
| V13.3.3 | v13-api-005 | GraphQL Admin Mutation Without Auth | 2 |

## V14 - Configuration

| ASVS Ref | Challenge ID | Challenge Name | Difficulty |
|---|---|---|---|
| V14.1.1 | v14-config-001 | Git Directory Exposed | 1 |
| V14.1.2 | v14-config-002 | Source Maps Exposed | 1 |
| V14.1.3 | v14-config-010 | Debug Mode Enabled | 1 |
| V14.2.1 | v14-config-003 | Vulnerable npm Packages | 1 |
| V14.3.1 | v14-config-004 | Hidden Endpoints via robots.txt | 1 |
| V14.3.2 | v14-config-005 | Public Swagger Documentation | 1 |
| V14.4.1 | v14-config-006 | No Security Headers | 1 |
| V14.4.2 | v14-config-007 | Clickjacking - No X-Frame-Options | 2 |
| V14.4.3 | v14-config-011 | CSRF No Token Validation | 2 |
| V14.5.1 | v14-config-008 | Bypass Rate Limit via X-Forwarded-For | 2 |
| V14.5.2 | v14-config-009 | Host Header Injection | 2 |
