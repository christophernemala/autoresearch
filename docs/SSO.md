# Enterprise Single Sign-On (SSO) Architecture

## 1. Supported Standards & Identity Providers
The O2C Orchestration SaaS platform supports enterprise identity federation using standards-based OpenID Connect (OIDC) and SAML 2.0:
- **Microsoft Entra ID** (formerly Azure Active Directory)
- **Google Workspace**
- **Okta Identity Cloud**
- **Auth0**

---

## 2. Security Protocols & Invariants

1. **PKCE (Proof Key for Code Exchange)**:
   Mandatory across all authorization code flows to eliminate code interception attacks.
2. **State & Nonce Cryptographic Validation**:
   Randomized single-use cryptographic tokens prevent Cross-Site Request Forgery (CSRF) and token replay attacks.
3. **Multi-Factor Authentication (MFA)**:
   Time-based One-Time Password (TOTP) enforcement per tenant policy.
4. **Session Lifetime**:
   - Short-lived JWT access tokens (15 minutes).
   - Rotating refresh tokens with immediate revocation on role downgrades or account lockout.
   - HTTP-only, SameSite=Strict, Secure cookies.
