# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us at:
- **Email:** security@amplizo.ai

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix Timeline:** Critical issues within 30 days

### Security Best Practices

When deploying Amplizo:

1. **Change default credentials** immediately after setup
2. **Use strong JWT secrets** (minimum 64 characters)
3. **Enable HTTPS** in production
4. **Keep dependencies updated** - run `npm audit` regularly
5. **Use environment variables** for sensitive data
6. **Enable CORS** only for trusted domains
7. **Rate limiting** is enabled by default

## Known Security Features

- JWT-based authentication with refresh tokens
- OAuth 2.0 support (Google, Facebook)
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection (React)

## Security Updates

Security updates will be released as patch versions. Subscribe to releases to stay informed.
