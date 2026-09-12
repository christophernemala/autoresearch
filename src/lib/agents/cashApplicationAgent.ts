export type MatchDisposition = 'AUTO_POST' | 'ANALYST_REVIEW' | 'UNRESOLVED_EXCEPTION';

export interface OpenInvoiceCandidate {
  invoiceId: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  amountDueRemaining: number;
  currency: string;
  dueDate: string;
}

export interface BankTransactionReceipt {
  transactionId: string;
  bankReference: string;
  amount: number;
  currency: string;
  remittanceText: string;
  paymentDate: string;
}

export interface CashMatchProposal {
  receiptId: string;
  matchedInvoiceIds: string[];
  matchedAmount: number;
  unappliedBalance: number;
  confidenceScore: number;
  disposition: MatchDisposition;
  matchingCriteria: 'EXACT_INVOICE_NUMBER' | 'CUSTOMER_AND_EXACT_AMOUNT' | 'MULTI_INVOICE_SUBSET' | 'MANUAL_REQUIRED';
  explanation: string;
}

export function matchBankReceiptToInvoices(
  receipt: BankTransactionReceipt,
  openInvoices: OpenInvoiceCandidate[]
): CashMatchProposal {
  // Step 1: Look for exact invoice transaction number in remittance text or bank reference
  for (const inv of openInvoices) {
    const hasInvoiceNumber =
      receipt.remittanceText.toUpperCase().includes(inv.transactionNumber.toUpperCase()) ||
      receipt.bankReference.toUpperCase().includes(inv.transactionNumber.toUpperCase());

    if (hasInvoiceNumber) {
      const isExactAmount = Math.abs(receipt.amount - inv.amountDueRemaining) <= 0.01;
      const confidence = isExactAmount ? 0.99 : 0.92;
      const applied = Math.min(receipt.amount, inv.amountDueRemaining);

      return {
        receiptId: receipt.transactionId,
        matchedInvoiceIds: [inv.invoiceId],
        matchedAmount: applied,
        unappliedBalance: Math.max(0, Number((receipt.amount - applied).toFixed(2))),
        confidenceScore: confidence,
        disposition: confidence >= 0.98 ? 'AUTO_POST' : 'ANALYST_REVIEW',
        matchingCriteria: 'EXACT_INVOICE_NUMBER',
        explanation: isExactAmount
          ? `Exact invoice reference ${inv.transactionNumber} and matching amount ${receipt.currency} ${receipt.amount.toLocaleString()}. Eligible for STP auto-post.`
          : `Invoice reference ${inv.transactionNumber} detected, but payment amount (${receipt.amount}) differs from open amount (${inv.amountDueRemaining}). Requires analyst review.`
      };
    }
  }

  // Step 2: Customer Name + Exact Amount single invoice match
  for (const inv of openInvoices) {
    const textHasCustomer = receipt.remittanceText.toUpperCase().includes(inv.customerName.toUpperCase());
    const isExactAmount = Math.abs(receipt.amount - inv.amountDueRemaining) <= 0.01;

    if (textHasCustomer && isExactAmount) {
      return {
        receiptId: receipt.transactionId,
        matchedInvoiceIds: [inv.invoiceId],
        matchedAmount: receipt.amount,
        unappliedBalance: 0,
        confidenceScore: 0.90,
        disposition: 'ANALYST_REVIEW',
        matchingCriteria: 'CUSTOMER_AND_EXACT_AMOUNT',
        explanation: `Customer name ${inv.customerName} and exact open balance match on invoice ${inv.transactionNumber}. Queued for analyst confirmation.`
      };
    }
  }

  // Step 3: Unresolved receipt
  return {
    receiptId: receipt.transactionId,
    matchedInvoiceIds: [],
    matchedAmount: 0,
    unappliedBalance: receipt.amount,
    confidenceScore: 0.35,
    disposition: 'UNRESOLVED_EXCEPTION',
    matchingCriteria: 'MANUAL_REQUIRED',
    explanation: `No deterministic invoice or customer match found for remittance text: "${receipt.remittanceText}". Flagged as unapplied cash exception.`
  };
}
