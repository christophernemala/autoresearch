# Architecture Specification: O2C Orchestration SaaS

This document defines the high-level architecture, component boundaries, data models, and integration tiers for the O2C Orchestration SaaS platform.

---

## 1. System Topology & Plane Separation

The application is structured into two strictly segregated planes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC MARKETING PLANE                         │
│  - Routes: /, /features, /security, /integrations, /docs               │
│  - SEO: Indexed via robots.txt & sitemap.xml                           │
│  - Structured Data: Schema.org SoftwareApplication, Organization       │
│  - OpenGraph, Twitter Cards, Responsive Landing Page                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SSO / Authentication Challenge
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATED SAAS PLANE                         │
│  - Routes: /app/*, /sco/*, /approvals/*, /settings/*                   │
│  - Multi-Tenant RLS & Explicit RBAC (12 Canonical Roles)               │
│  - Maker–Checker Four-Eyes Cryptographic Governance                    │
│  - Deterministic Math: Aging, DSO, CEI, IFRS 9 ECL Provisioning        │
│  - Immutable Append-Only Audit Ledger (SHA-256 Chained)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Adapter Interfaces
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATION TIER                       │
│  - Tier-1 ERPs: SAP S/4HANA (OData), Oracle Fusion, NetSuite           │
│  - Bank Ingestion: SWIFT MT940 / CAMT.053, XLSX/CSV                    │
│  - Identity Providers: Google Workspace, Microsoft Entra ID, Okta     │
│  - Notifications: AWS SES, SendGrid (Draft-Only until authenticated)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant Architecture & Data Isolation

### Normalized Tenancy Schema:
1. **`tenants`**: Tenant UUID, company name, primary currency, SSO configuration, MFA policy.
2. **`organizations`**: Legal entities under a tenant (e.g. Acme USA, Acme EMEA).
3. **`users`**: User UUID, tenant ID, email, role, MFA status.
4. **`memberships`**: Maps users to tenants with specific permissions.

### Cross-Tenant Boundary Rules:
- Every database query is tenant-scoped (`WHERE tenant_id = current_tenant_id()`).
- Supabase Row-Level Security (RLS) validates `auth.uid() -> memberships.tenant_id`.
- Tenant IDs supplied in client query params or headers are never trusted without cryptographic session validation.

---

## 3. Cryptographic Governance: Maker–Checker

All financially material adjustments require dual-signature authorization:
1. **Maker Phase**:
   - Generates action proposal.
   - Computes canonical payload hash:
     $$\text{payloadHash} = \text{SHA-256}(\text{canonicalJson}(\text{payload}))$$
2. **Checker Phase**:
   - Invariant enforced: $\text{checkerUserId} \neq \text{makerUserId}$.
   - Immediate re-computation of payload hash prior to execution.
   - If computed hash differs from proposal hash $\implies \text{Status} = \text{TAMPER\_DETECTED}$ (Execution aborted).

---

## 4. Immutable Audit Trail

Every audit event is cryptographically chained to its predecessor:
$$\text{eventHash} = \text{SHA-256}(\text{prevHash} + \text{timestamp} + \text{actorId} + \text{action} + \text{resourceId} + \text{correlationId})$$

This construction guarantees:
- Tamper evidence: any alteration of historical events invalidates subsequent hashes.
- Comprehensive forensic traceability answering Who, What, When, Where, Why.
- SOC 2 Type II audit readiness.
