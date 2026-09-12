export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TaxLineItem {
  taxType: 'VAT' | 'GST' | 'EXEMPT' | 'CUSTOMS';
  rate: number;
  taxAmount: number;
}

export interface JournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export function validateInvoiceReconciliation(
  subtotal: number,
  lines: InvoiceLineItem[],
  taxLines: TaxLineItem[],
  total: number
): { valid: boolean; calculatedTotal: number; error?: string } {
  const lineSum = lines.reduce((acc, l) => acc + l.lineTotal, 0);
  const taxSum = taxLines.reduce((acc, t) => acc + t.taxAmount, 0);
  const calculatedTotal = Number((lineSum + taxSum).toFixed(2));
  const expectedTotal = Number(total.toFixed(2));

  if (Math.abs(calculatedTotal - expectedTotal) > 0.01) {
    return {
      valid: false,
      calculatedTotal,
      error: `INVARIANT_VIOLATION: Invoice total (${expectedTotal}) does not match sum of lines (${lineSum}) and taxes (${taxSum}) = ${calculatedTotal}`
    };
  }

  return { valid: true, calculatedTotal };
}

export function validateCashApplicationBounds(params: {
  appliedAmount: number;
  availablePaymentBalance: number;
  outstandingInvoiceBalance: number;
}): { valid: boolean; error?: string } {
  const { appliedAmount, availablePaymentBalance, outstandingInvoiceBalance } = params;

  if (appliedAmount <= 0) {
    return {
      valid: false,
      error: 'INVARIANT_VIOLATION: Applied cash amount must be greater than zero.'
    };
  }

  if (appliedAmount > availablePaymentBalance + 0.001) {
    return {
      valid: false,
      error: `INVARIANT_VIOLATION: Cash application (${appliedAmount}) exceeds available payment balance (${availablePaymentBalance}).`
    };
  }

  if (appliedAmount > outstandingInvoiceBalance + 0.001) {
    return {
      valid: false,
      error: `INVARIANT_VIOLATION: Cash application (${appliedAmount}) exceeds invoice outstanding balance (${outstandingInvoiceBalance}).`
    };
  }

  return { valid: true };
}

export function validateJournalEntryBalance(lines: JournalEntryLine[]): {
  valid: boolean;
  totalDebits: number;
  totalCredits: number;
  error?: string;
} {
  const totalDebits = Number(lines.reduce((acc, l) => acc + l.debit, 0).toFixed(2));
  const totalCredits = Number(lines.reduce((acc, l) => acc + l.credit, 0).toFixed(2));

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return {
      valid: false,
      totalDebits,
      totalCredits,
      error: `INVARIANT_VIOLATION: Journal entry is unbalanced. Debits (${totalDebits}) != Credits (${totalCredits}). Difference: ${(totalDebits - totalCredits).toFixed(2)}`
    };
  }

  return { valid: true, totalDebits, totalCredits };
}
