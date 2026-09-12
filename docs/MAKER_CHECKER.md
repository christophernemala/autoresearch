# Maker–Checker / Four-Eyes Governance Specification

## 1. Overview
In enterprise financial systems, self-approval of financially material actions represents a critical vulnerability. The O2C Orchestration platform enforces a strict dual-authorization (Maker–Checker) protocol across all controlled actions:
- Credit limit overrides
- Bad debt write-offs
- Credit note creation
- General Ledger journal postings
- Cash application exceptions
- Invoice adjustments
- High-risk sales order approvals
- Dispute settlements

---

## 2. Hard Invariants

### Invariant 1: Strict Segregation of Duties (SoD)
$$\text{makerUserId} \neq \text{checkerUserId}$$
If a user attempts to approve a proposal they created (or an agent attempts to self-approve), the platform rejects the action with code `SECURITY_BREACH`.

### Invariant 2: Cryptographic Payload Immutability
At proposal creation time, the Maker computes:
$$\text{payloadHash} = \text{SHA-256}(\text{canonicalJson}(\text{payload}))$$
Prior to execution, the Checker re-evaluates the hash of the current payload. If the hash does not match:
$$\text{status} = \text{TAMPER\_DETECTED} \implies \text{ABORT\_EXECUTION}$$

---

## 3. Approval Lifecycle Stages

```
PREPARE (Maker compiles action payload)
   │
   ▼
VALIDATE (Check bounds, limits, and customer state)
   │
   ▼
REQUEST APPROVAL (Record proposal & immutable SHA-256 hash)
   │
   ▼
REVIEW (Independent Checker reviews exact payload & hash)
   │
   ├── [APPROVE] ──▶ Recompute hash ──▶ EXECUTE ──▶ VERIFY ──▶ PROVE
   └── [REJECT]  ──▶ Return to Maker with review comments
```
