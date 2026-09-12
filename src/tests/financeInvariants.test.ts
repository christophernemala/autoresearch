import { describe, it, expect } from 'vitest';
import {
  createApprovalProposal,
  reviewApproval,
  canonicalJsonString,
  computeSha256
} from '../lib/governance/makerChecker';
import {
  validateInvoiceReconciliation,
  validateCashApplicationBounds,
  validateJournalEntryBalance
} from '../lib/finance/invariants';
import { calculateIfrs9Ecl } from '../lib/finance/eclEngine';

describe('Financial Invariants & Governance', () => {
  describe('Maker-Checker / Four-Eyes Cryptographic Controls', () => {
    it('should create proposal with deterministic SHA-256 payload hash', async () => {
      const payload = { customerId: 'cust-101', adjustmentAmount: 5000, reason: 'Pricing dispute settlement' };
      const proposal = await createApprovalProposal({
        tenantId: 'tenant-acme',
        actionType: 'INVOICE_ADJUSTMENT',
        makerUserId: 'user-maker-1',
        makerName: 'Daniel Maker',
        payload,
        amount: 5000,
        currency: 'USD',
        reason: 'Authorized pricing dispute'
      });

      expect(proposal.status).toBe('PENDING_APPROVAL');
      expect(proposal.payloadHash).toBeDefined();
      expect(proposal.payloadHash.length).toBe(64); // SHA-256 hex string
    });

    it('should REJECT approval if Maker attempts to self-approve (SoD Violation)', async () => {
      const payload = { accountId: 'acc-99', creditLimit: 250000 };
      const proposal = await createApprovalProposal({
        tenantId: 'tenant-acme',
        actionType: 'CREDIT_LIMIT_OVERRIDE',
        makerUserId: 'user-maker-1',
        makerName: 'Daniel Maker',
        payload,
        amount: 250000,
        currency: 'USD',
        reason: 'Executive credit limit increase'
      });

      // Self-approval attempt: checkerUserId === makerUserId
      const reviewResult = await reviewApproval({
        request: proposal,
        checkerUserId: 'user-maker-1', // SAME AS MAKER!
        checkerName: 'Daniel Maker',
        decision: 'APPROVE',
        currentPayload: payload
      });

      expect(reviewResult.success).toBe(false);
      expect(reviewResult.error).toContain('SECURITY_BREACH');
      expect(reviewResult.updatedRequest.status).toBe('FAILED');
    });

    it('should detect TAMPERING if payload is modified after proposal creation', async () => {
      const originalPayload = { invoiceId: 'inv-404', writeOffAmount: 1000 };
      const proposal = await createApprovalProposal({
        tenantId: 'tenant-acme',
        actionType: 'WRITE_OFF',
        makerUserId: 'user-maker-1',
        makerName: 'Daniel Maker',
        payload: originalPayload,
        amount: 1000,
        currency: 'USD',
        reason: 'Small balance write-off'
      });

      // Malicious or accidental mutation: writeOffAmount changed from 1000 to 10000
      const tamperedPayload = { invoiceId: 'inv-404', writeOffAmount: 10000 };

      const reviewResult = await reviewApproval({
        request: proposal,
        checkerUserId: 'user-checker-2', // Valid independent checker
        checkerName: 'Victoria Checker',
        decision: 'APPROVE',
        currentPayload: tamperedPayload
      });

      expect(reviewResult.success).toBe(false);
      expect(reviewResult.error).toContain('TAMPER_DETECTED');
      expect(reviewResult.updatedRequest.status).toBe('TAMPER_DETECTED');
    });

    it('should successfully approve when Checker is independent and payload is untampered', async () => {
      const payload = { customerId: 'cust-200', newLimit: 150000 };
      const proposal = await createApprovalProposal({
        tenantId: 'tenant-acme',
        actionType: 'CREDIT_LIMIT_OVERRIDE',
        makerUserId: 'user-maker-1',
        makerName: 'Daniel Maker',
        payload,
        amount: 150000,
        currency: 'USD',
        reason: 'Annual limit review'
      });

      const reviewResult = await reviewApproval({
        request: proposal,
        checkerUserId: 'user-checker-2',
        checkerName: 'Victoria Checker',
        decision: 'APPROVE',
        currentPayload: payload
      });

      expect(reviewResult.success).toBe(true);
      expect(reviewResult.updatedRequest.status).toBe('APPROVED');
      expect(reviewResult.updatedRequest.checkerUserId).toBe('user-checker-2');
    });
  });

  describe('Financial Calculation Invariants', () => {
    it('should validate invoice lines and taxes reconcile exactly to invoice total', () => {
      const lines = [
        { id: '1', description: 'Enterprise License', quantity: 1, unitPrice: 10000, lineTotal: 10000 },
        { id: '2', description: 'Implementation Support', quantity: 1, unitPrice: 2500, lineTotal: 2500 }
      ];
      const taxLines = [{ taxType: 'VAT' as const, rate: 0.05, taxAmount: 625 }];

      const validResult = validateInvoiceReconciliation(12500, lines, taxLines, 13125);
      expect(validResult.valid).toBe(true);

      const invalidResult = validateInvoiceReconciliation(12500, lines, taxLines, 13120); // Discrepancy of 5
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('INVARIANT_VIOLATION');
    });

    it('should prevent cash application exceeding payment balance or invoice balance', () => {
      // Valid application
      const valid = validateCashApplicationBounds({
        appliedAmount: 5000,
        availablePaymentBalance: 10000,
        outstandingInvoiceBalance: 5000
      });
      expect(valid.valid).toBe(true);

      // Exceeds payment
      const exceedsPayment = validateCashApplicationBounds({
        appliedAmount: 12000,
        availablePaymentBalance: 10000,
        outstandingInvoiceBalance: 15000
      });
      expect(exceedsPayment.valid).toBe(false);

      // Exceeds invoice
      const exceedsInvoice = validateCashApplicationBounds({
        appliedAmount: 8000,
        availablePaymentBalance: 10000,
        outstandingInvoiceBalance: 5000
      });
      expect(exceedsInvoice.valid).toBe(false);
    });

    it('should ensure journal entry total debits equal total credits', () => {
      const balancedLines = [
        { accountId: '1010', accountName: 'Cash', debit: 5000, credit: 0 },
        { accountId: '1200', accountName: 'Accounts Receivable', debit: 0, credit: 5000 }
      ];
      const balanced = validateJournalEntryBalance(balancedLines);
      expect(balanced.valid).toBe(true);

      const unbalancedLines = [
        { accountId: '1010', accountName: 'Cash', debit: 5000, credit: 0 },
        { accountId: '1200', accountName: 'Accounts Receivable', debit: 0, credit: 4900 }
      ];
      const unbalanced = validateJournalEntryBalance(unbalancedLines);
      expect(unbalanced.valid).toBe(false);
      expect(unbalanced.error).toContain('INVARIANT_VIOLATION');
    });
  });

  describe('IFRS 9 Expected Credit Loss Engine', () => {
    it('should compute deterministic ECL with 100% provision on 361+ bucket', () => {
      const exposures = {
        'Current': 1000000,
        '1-30': 500000,
        '31-60': 200000,
        '61-90': 100000,
        '91-180': 50000,
        '181-360': 20000,
        '361+': 10000
      };

      const result = calculateIfrs9Ecl(exposures, 'BASELINE');
      expect(result.totalEad).toBe(1880000);
      expect(result.totalProvision).toBeGreaterThan(0);

      // 361+ bucket must have 100% effective provision
      const bucket361 = result.bucketResults.find((b) => b.bucket === '361+');
      expect(bucket361).toBeDefined();
      expect(bucket361?.effectiveRate).toBe(1.0);
      expect(bucket361?.provisionAmount).toBe(10000);
    });
  });

  describe('Immutable Audit Trail (SHA-256 Hash Chaining)', () => {
    it('should maintain unbroken cryptographic hash chain across sequential events', async () => {
      const { ImmutableAuditLedger } = await import('../lib/sco/auditTrail');
      const ledger = new ImmutableAuditLedger();

      await ledger.recordEvent({
        tenantId: 'tenant-acme',
        actorType: 'USER',
        actorId: 'usr-controller',
        actorName: 'Eleanor Controller',
        action: 'INVOICE_GENERATED',
        resourceType: 'INVOICE',
        resourceId: 'inv-9901',
        requestId: 'req-01',
        correlationId: 'corr-01',
        ipAddress: '192.168.1.1',
        userAgent: 'TestRunner/1.0'
      });

      await ledger.recordEvent({
        tenantId: 'tenant-acme',
        actorType: 'AGENT',
        actorId: 'agent-collections',
        actorName: 'Collections Agent',
        action: 'DUNNING_NOTICE_QUEUED',
        resourceType: 'COLLECTIONS_CASE',
        resourceId: 'col-552',
        requestId: 'req-02',
        correlationId: 'corr-02',
        ipAddress: '127.0.0.1',
        userAgent: 'AgentWorker/2.4'
      });

      const verification = await ledger.verifyLedgerIntegrity();
      expect(verification.valid).toBe(true);
    });
  });
});
