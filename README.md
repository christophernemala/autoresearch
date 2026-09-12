# O2C Orchestration — Enterprise Financial SaaS

> **Mission-Critical Order-to-Cash (O2C) Orchestration Platform** with deterministic multi-agent governance, IFRS 9 Expected Credit Loss (ECL) provisioning, automated bank reconciliation, and Maker–Checker four-eyes cryptographic security.

[![O2C CI](https://github.com/christophernemala/autoresearch/actions/workflows/o2c-build.yml/badge.svg)](https://github.com/christophernemala/autoresearch/actions/workflows/o2c-build.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Security: SOC 2 Ready](https://img.shields.io/badge/Security-SOC%202%20Ready-green.svg)](docs/SCO.md)

---

## 🏛 Platform Overview

O2C Orchestration is an enterprise receivables intelligence and subledger control platform designed for corporate treasuries, controllers, and finance operations. Unlike generic dashboard mockups, this platform enforces strict financial invariants:
- **Zero Floating-Point Money**: All computations use fixed-decimal rounding rules.
- **Segregation of Duties (SoD)**: Enforces `makerUserId !== checkerUserId` across all material financial adjustments.
- **Cryptographic Tamper Detection**: Computes canonical SHA-256 payload hashes at proposal creation; execution automatically aborts if the payload is modified in transit.
- **Deterministic Mathematics**: Aging distributions, DSO, CEI, and IFRS 9 ECL provisions ($ECL = PD \times LGD \times EAD$) are computed via audited mathematical models rather than generative hallucination.

---

## 🚀 Key Modules & Capabilities

### 1. Executive Command Center (`/dashboard`)
- Real-time aggregated portfolio metrics: Total AR, Overdue AR, 90+ Overdue, DSO (Days Sales Outstanding), CEI (Collection Effectiveness Index).
- Aging distribution across 7 standardized buckets: Current, 1–30, 31–60, 61–90, 91–180, 181–360, 361+.
- Entity-level exposure bars and high-value operational exception ranking.

### 2. Receivables Aging Subledger (`/receivables`)
- Subledger invoice table with multi-dimensional filtering (legal entity, category, aging bucket, risk level).
- Real-time search across customers, invoice transaction numbers, and credit managers.
- Spring-animated slide-over drawer with complete transaction audit history.

### 3. Collections Workspace (`/collections`)
- Operational worklist prioritized by overdue severity and risk rating.
- Promise-to-pay (PTP) recording and broken promise detection.
- Humanized Dunning draft generation (labeled draft-only until reviewed and approved).

### 4. Cash Application & Bank Matching (`/allocation`)
- Hierarchical deterministic matching algorithm:
  - Exact invoice reference match ($\ge 98\%$ confidence $\rightarrow$ eligible for Straight-Through Processing).
  - Customer name + exact amount match ($80\% - 97.9\%$ confidence $\rightarrow$ queued for analyst review).
  - Unidentified receipts ($< 80\%$ confidence $\rightarrow$ flagged as unapplied cash exceptions).

### 5. Credit Control & IFRS 9 ECL (`/credit`)
- Deterministic Expected Credit Loss matrix calculator based on historical loss experience.
- Dynamic macroeconomic scenario overlays (Baseline 1.0x, Downturn 1.25x, Upturn 0.85x).
- 100% loss provision logic for exposures aged $\ge 361$ days.

### 6. Maker–Checker Governance (`/approvals`)
- Formal four-eyes approval workflow for credit limit overrides, bad debt write-offs, credit notes, and dispute settlements.
- SHA-256 canonical JSON payload hashing.
- Integrated interactive simulation demonstrating cryptographic tamper detection.

### 7. Security Compliance Officer Console (`/sco`)
- Immutable audit explorer with SHA-256 event hash chaining answering Who, What, When, Where, Why.
- One-click cryptographic hash chain verification.
- 12-role RBAC access matrix and real-time security incident telemetry.

### 8. Enterprise Integration Hub (`/integrations`)
- Standardized adapter interfaces for SAP S/4HANA, Oracle Fusion Cloud ERP, and NetSuite.
- ISO 20022 SWIFT MT940 / CAMT.053 bank statement ingestion parser.
- Real connection testing that reports honest connection states (`CONFIGURED` vs. `INTEGRATION_NOT_CONFIGURED`).

---

## 🛠 Tech Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React + TypeScript | 18.3 / 5.7 | Strict-mode frontend application |
| **Bundler** | Vite | 6.0.5 | Sub-second HMR and optimized production bundles |
| **Motion** | Framer Motion | 12.41 | Spring physics transitions (`stiffness: 300, damping: 25`) |
| **Icons** | Lucide React | 0.468 | High-clarity institutional iconography |
| **Database/Auth** | Supabase (PostgreSQL) | 2.75 | Row-Level Security (RLS) & Multi-Tenant schema |
| **Testing** | Vitest | 5.0.0 | Unit tests for financial invariants & tamper guards |
| **Typography** | Outfit + Inter + JetBrains Mono | Variable | Google Fonts CDN typography pairing |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/christophernemala/autoresearch.git
cd autoresearch

# 2. Checkout feature branch
git checkout dhcm-finance-control-hub

# 3. Install dependencies
npm install

# 4. Run automated test suite
npm run test

# 5. Verify type safety
npm run typecheck

# 6. Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Multi-Tenant Authentication & Role Personas

The platform includes preconfigured enterprise demo personas:
- **Finance Controller**: `controller@acme-corp.com` (Full subledger & approval access)
- **Credit Manager**: `credit.mgr@acme-corp.com` (Credit scoring & limit management)
- **Senior Signer (Checker)**: `checker@acme-corp.com` (Independent Four-Eyes reviewer)
- **AR Operations (Maker)**: `maker@acme-corp.com` (Proposal creator)
- **SOC 2 Auditor**: `auditor@compliance.firm` (Read-only compliance & audit view)

Click **"Switch Role / SSO"** in the topbar to test authentication flows, TOTP MFA challenges, or enterprise SSO simulation (Google Workspace, Microsoft Entra ID, Okta).

---

## 🧪 Verification & Automated Tests

Run the complete test suite:
```bash
npm run test
```

### Test Coverage Summary:
- **`src/tests/branding.test.ts`**: Regression test ensuring 0 occurrences of legacy branding in active source.
- **`src/tests/financeInvariants.test.ts`**:
  - Segregation of Duties (`makerUserId !== checkerUserId`).
  - Cryptographic tamper detection aborting execution on modified payloads.
  - Independent Checker approval.
  - Invoice lines + taxes exact total reconciliation.
  - Cash application bounds checking.
  - Journal entry balanced debits = credits.
  - IFRS 9 ECL calculation with 100% loss rate for 361+ bucket.
  - Immutable audit trail SHA-256 hash chaining verification.

---

## 📖 Architecture & Governance Documentation

- [Target Architecture](ARCHITECTURE.md)
- [Agent Governance & State Machines](AGENTS.md)
- [Current State Audit Report](docs/CURRENT_STATE_AUDIT.md)
- [Research Findings](docs/RESEARCH_FINDINGS.md)
- [Design System & Typography](docs/DESIGN_RESEARCH.md)
- [Maker–Checker Cryptographic Specification](docs/MAKER_CHECKER.md)
- [IFRS 9 ECL Provisioning Model](docs/IFRS9_ECL.md)
- [Single Sign-On (SSO) Architecture](docs/SSO.md)
- [Security Compliance Officer (SCO) Blueprint](docs/SCO.md)
- [Production Readiness Matrix](docs/PRODUCTION_READINESS.md)

---

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
