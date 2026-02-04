# Security Policy

## Supported Versions

The following versions of the project are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow the responsible disclosure process outlined below.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **GitHub Security Advisories (Preferred)**: Use the [GitHub Security Advisories](https://github.com/Kushmanmb/kywmahmb/security/advisories/new) feature to privately report vulnerabilities.

2. **Direct Contact**: If you prefer, you can contact the maintainer directly through GitHub at [@Kushmanmb](https://github.com/Kushmanmb).

### What to Include

When reporting a vulnerability, please include the following information:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass, etc.)
- Full paths of source file(s) related to the manifestation of the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Investigation**: We will investigate and validate the reported vulnerability within 7 days.
- **Fix Development**: If the vulnerability is confirmed, we will work on a fix and aim to release a patch within 30 days, depending on the complexity.
- **Disclosure**: Once a fix is released, we will publicly disclose the vulnerability in a security advisory, giving credit to the reporter (unless anonymity is requested).

### Security Update Process

When a security vulnerability is fixed:

1. A security advisory will be published on GitHub
2. A new version will be released with the fix
3. The CHANGELOG will be updated with security fix details
4. Users will be notified through GitHub release notifications

## Security Best Practices

When using this project, we recommend following these security best practices:

### For Developers

1. **Environment Variables**: Never commit sensitive data (API keys, private keys, passwords) to version control.
   - Use `.env` files for local development
   - Keep `.env` in `.gitignore`
   - Use `.env.example` as a template

2. **Dependency Management**:
   - Regularly run `npm audit` to check for known vulnerabilities
   - Keep dependencies up to date with `npm update`
   - Review and remove unused dependencies
   - Review dependency licenses for compatibility

3. **Smart Contract Security** (Ethereum Integration):
   - **Never store private keys in code or environment variables on production servers**
   - Use hardware wallets or secure key management systems for production
   - For testing, use testnet tokens only
   - Validate all user input, especially addresses and amounts
   - Be cautious with contract interactions and gas limits

4. **Input Validation**:
   - Always validate and sanitize user input
   - Use parameterized queries to prevent injection attacks
   - Validate Ethereum addresses using proper format checks

5. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Log detailed errors internally but return generic messages to users
   - Monitor and review error logs regularly

### For Users

1. **Faucet Usage**:
   - Only use the faucet on testnets
   - Never send real funds to testnet addresses
   - Be aware of rate limits and cooldown periods

2. **Contract Verification**:
   - Only verify contracts you own or have permission to verify
   - Keep API keys secure and never share them
   - Use read-only API keys when possible

3. **Game Usage**:
   - This is a demonstration/testing application
   - Don't use it with real funds or on mainnet without proper auditing

## Additional Resources

For more information on security in this project, refer to:

- [Coding Guidelines - Security Best Practices](CODING_GUIDELINES.md#security-best-practices)
- [Development Infrastructure](.github/DEVELOPMENT_INFRASTRUCTURE.md)

## Security Acknowledgments

We appreciate the security research community and will acknowledge security researchers who responsibly disclose vulnerabilities to us. If you'd like to be credited, please let us know when reporting the vulnerability.

## Policy Updates

This security policy may be updated from time to time. Please check back regularly for any changes. The last update was made on February 4, 2026.
