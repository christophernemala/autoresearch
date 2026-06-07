import type { AgentAction, BankTransaction, Customer, EntityAging, ImportValidationResult, Invoice } from '../types';
import { validateOracleArColumns } from '../lib/oracleImport';

export const entities: EntityAging[] = [
  { entity: 'DCM', totalAr: 820_000_000, current: 492_000_000, overdue: 328_000_000, critical90: 112_000_000, critical180: 54_000_000, dso: 58.4, cei: 84.2, eclProvision: 18_400_000 },
  { entity: 'DPCM', totalAr: 410_000_000, current: 274_000_000, overdue: 136_000_000, critical90: 46_000_000, critical180: 18_500_000, dso: 46.9, cei: 88.1, eclProvision: 7_300_000 },
  { entity: 'DPDM', totalAr: 365_000_000, current: 197_000_000, overdue: 168_000_000, critical90: 62_000_000, critical180: 25_000_000, dso: 63.8, cei: 78.5, eclProvision: 10_900_000 },
  { entity: 'NCM', totalAr: 502_000_000, current: 348_000_000, overdue: 154_000_000, critical90: 38_000_000, critical180: 12_000_000, dso: 42.7, cei: 91.4, eclProvision: 5_900_000 },
  { entity: 'NPCM', totalAr: 345_000_000, current: 213_000_000, overdue: 132_000_000, critical90: 52_000_000, critical180: 22_000_000, dso: 54.3, cei: 82.0, eclProvision: 8_100_000 }
];

export const customers: Customer[] = [
  { id: 'cust-emaar', number: 'C-10021', name: 'Emaar Properties PJSC', entity: 'DCM', vertical: 'Real Estate', primaryContact: 'Mariam Al Farsi', email: 'finance.ap@example.com', totalOutstanding: 142_800_000, overdueAmount: 48_200_000, amount90: 21_700_000, amount180: 8_900_000, unappliedReceipts: 3_250_000, riskScore: 78, eclExposure: 4_860_000, lastPaymentDate: '2025-04-26', lastContactDate: '2025-05-09', nextFollowUpDate: '2025-05-16' },
  { id: 'cust-meraas', number: 'C-10048', name: 'Meraas Holding', entity: 'DPCM', vertical: 'Leisure', primaryContact: 'Omar Haddad', email: 'collections@example.com', totalOutstanding: 96_400_000, overdueAmount: 33_500_000, amount90: 17_300_000, amount180: 4_600_000, unappliedReceipts: 1_100_000, riskScore: 71, eclExposure: 3_120_000, lastPaymentDate: '2025-04-12', lastContactDate: '2025-05-11', nextFollowUpDate: '2025-05-18' },
  { id: 'cust-nakheel', number: 'C-10076', name: 'Nakheel Communities', entity: 'NCM', vertical: 'Communities', primaryContact: 'Sara Khan', email: 'ap.team@example.com', totalOutstanding: 188_200_000, overdueAmount: 57_800_000, amount90: 25_400_000, amount180: 11_600_000, unappliedReceipts: 4_800_000, riskScore: 83, eclExposure: 6_440_000, lastPaymentDate: '2025-05-02', lastContactDate: '2025-05-10', nextFollowUpDate: '2025-05-14' }
];

export const invoices: Invoice[] = [
  { id: 'inv-9001', customerId: 'cust-emaar', transactionNumber: 'AR-INV-9001', dueDate: '2025-01-15', daysLate: 116, bucket: '91-180', amountDue: 12_400_000, status: 'open' },
  { id: 'inv-9002', customerId: 'cust-emaar', transactionNumber: 'AR-INV-9002', dueDate: '2024-11-22', daysLate: 170, bucket: '91-180', amountDue: 9_300_000, status: 'disputed' },
  { id: 'inv-9010', customerId: 'cust-meraas', transactionNumber: 'AR-INV-9010', dueDate: '2025-02-03', daysLate: 97, bucket: '91-180', amountDue: 17_300_000, status: 'open' },
  { id: 'inv-9025', customerId: 'cust-nakheel', transactionNumber: 'AR-INV-9025', dueDate: '2024-10-30', daysLate: 193, bucket: '181-360', amountDue: 11_600_000, status: 'partially_paid' }
];

export const bankTransactions: BankTransaction[] = [
  { id: 'bank-001', bankAccount: 'ENBD Operating AED', date: '2025-05-09', reference: 'TRF EMAAR AR-INV-9001', customerHint: 'Emaar Properties PJSC', amount: 7_200_000, status: 'review_required', confidence: 87 },
  { id: 'bank-002', bankAccount: 'Mashreq Collections AED', date: '2025-05-10', reference: 'MERAAS PAYMENT MAY', customerHint: 'Meraas Holding', amount: 4_600_000, status: 'partially_matched', confidence: 74 },
  { id: 'bank-003', bankAccount: 'ADCB Receipts AED', date: '2025-05-11', reference: 'UNALLOCATED BULK RECEIPT', customerHint: 'Unknown', amount: 2_900_000, status: 'unmatched', confidence: 31 }
];

const oracleMayUploadedColumns = [
  'Customer Number',
  'Customer Name',
  'Customer Vertical',
  'Bill To Location',
  'Site Use Name',
  'Company Name',
  'Receivable Account',
  'Intercompany',
  'Project',
  'Profit Center',
  'Contract Number',
  'Reference',
  'Transaction Source',
  'Transaction Type',
  'Transaction Number',
  'Transaction Description',
  'GL Date',
  'Transaction Date',
  'Due Date',
  'Days Late',
  'Original Invoice Amount',
  'Applied Amount',
  'Amount Due Remaining',
  'Advertiser',
  'PO Number',
  'Sales Rep',
  'Current',
  '1-30 Days',
  '31-60 Days',
  '61-90 Days',
  '91-180 Days',
  '181-360 Days',
  '361+ Days'
];

export const importResults: ImportValidationResult[] = [
  {
    id: 'import-oracle-may',
    fileName: 'Oracle_AR_Aging_May_2025.xlsx',
    uploadedAt: '2025-05-12T08:00:00+04:00',
    status: 'review_required',
    missingColumns: validateOracleArColumns(oracleMayUploadedColumns),
    failedRows: 14,
    validRows: 1842,
    notes: ['7 rows contain invalid due dates', '4 rows have negative amount due remaining', '3 rows map to unknown entity codes']
  }
];

export const agentActions: AgentAction[] = [
  { id: 'act-001', title: 'Prioritize 91+ invoices above AED 250k', description: 'Draft collection queue prepared for Finance Manager review.', status: 'pending_approval', riskLevel: 'medium', createdAt: '2025-05-12T09:15:00+04:00' },
  { id: 'act-002', title: 'Draft SOA follow-up for Nakheel Communities', description: 'SOA email draft and invoice attachment checklist are waiting for approval.', status: 'draft', riskLevel: 'low', createdAt: '2025-05-12T09:35:00+04:00' }
];

export function formatAed(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `AED ${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
  return `AED ${value.toLocaleString('en-AE')}`;
}
