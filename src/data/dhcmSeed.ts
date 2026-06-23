import type {
  AgentAction,
  AllocationReceipt,
  CollectionAccount,
  ControlItem,
  Customer,
  DisputeCase,
  EntityAging,
  ImportValidationResult,
  Invoice,
  Receivable,
  ReportDefinition,
  TreasuryPosition
} from '../types';
import { validateOracleArColumns } from '../lib/oracleImport';

export const entities: EntityAging[] = [
  { entity: 'DHCM', legalName: 'Dubai Holding Community Management LLC', totalAr: 684_250_000, current: 384_100_000, overdue: 300_150_000, critical90: 118_400_000, critical180: 47_600_000, dso: 57.6, cei: 84.8, eclProvision: 21_900_000 },
  { entity: 'NCM', legalName: 'Nakheel Properties for Community Management LLC', totalAr: 512_780_000, current: 316_400_000, overdue: 196_380_000, critical90: 73_500_000, critical180: 29_100_000, dso: 49.2, cei: 88.1, eclProvision: 12_700_000 },
  { entity: 'DCM', legalName: 'Dubai Community Management LLC', totalAr: 458_930_000, current: 248_300_000, overdue: 210_630_000, critical90: 82_260_000, critical180: 34_700_000, dso: 63.4, cei: 79.6, eclProvision: 16_500_000 },
  { entity: 'DPCM LLC', legalName: 'Dubai Properties Community Management LLC', totalAr: 338_460_000, current: 221_700_000, overdue: 116_760_000, critical90: 41_850_000, critical180: 13_900_000, dso: 44.8, cei: 91.2, eclProvision: 6_900_000 },
  { entity: 'DPDM LLC', legalName: 'Dubai Properties District Management LLC', totalAr: 296_320_000, current: 171_500_000, overdue: 124_820_000, critical90: 44_100_000, critical180: 17_800_000, dso: 52.9, cei: 86.7, eclProvision: 8_200_000 },
  { entity: 'Community Corp LLC', legalName: 'Community Corporation LLC', totalAr: 184_980_000, current: 103_850_000, overdue: 81_130_000, critical90: 29_440_000, critical180: 8_600_000, dso: 48.1, cei: 89.4, eclProvision: 4_700_000 }
];

export const customers: Customer[] = [
  { id: 'cust-park-estates', number: 'C-24018', name: 'Park Estates Owners Association', entity: 'DHCM', vertical: 'Master Community', primaryContact: 'Finance Manager', email: 'ap@example.invalid', totalOutstanding: 84_250_000, overdueAmount: 36_180_000, amount90: 18_420_000, amount180: 6_100_000, unappliedReceipts: 2_600_000, riskScore: 78, eclExposure: 4_240_000, lastPaymentDate: '2026-05-31', lastContactDate: '2026-06-17', nextFollowUpDate: '2026-06-25' },
  { id: 'cust-marina-master', number: 'C-24044', name: 'Marina District Master Community', entity: 'DCM', vertical: 'Mixed Use', primaryContact: 'Accounts Payable', email: 'ap@example.invalid', totalOutstanding: 116_900_000, overdueAmount: 61_320_000, amount90: 27_900_000, amount180: 11_800_000, unappliedReceipts: 3_450_000, riskScore: 84, eclExposure: 7_820_000, lastPaymentDate: '2026-05-21', lastContactDate: '2026-06-18', nextFollowUpDate: '2026-06-24' },
  { id: 'cust-palm-residences', number: 'C-24077', name: 'Palm Residences Service Charges', entity: 'NCM', vertical: 'Residential', primaryContact: 'Shared Services', email: 'ap@example.invalid', totalOutstanding: 142_650_000, overdueAmount: 52_750_000, amount90: 22_600_000, amount180: 8_900_000, unappliedReceipts: 5_800_000, riskScore: 73, eclExposure: 5_940_000, lastPaymentDate: '2026-06-03', lastContactDate: '2026-06-16', nextFollowUpDate: '2026-06-27' },
  { id: 'cust-creek-retail', number: 'C-24110', name: 'Creek Retail Facilities LLC', entity: 'DPCM LLC', vertical: 'Retail', primaryContact: 'Treasury Desk', email: 'ap@example.invalid', totalOutstanding: 59_430_000, overdueAmount: 18_220_000, amount90: 7_650_000, amount180: 2_100_000, unappliedReceipts: 1_250_000, riskScore: 58, eclExposure: 1_780_000, lastPaymentDate: '2026-06-12', lastContactDate: '2026-06-14', nextFollowUpDate: '2026-06-28' },
  { id: 'cust-business-bay', number: 'C-24132', name: 'Business Bay Community Jointly Owned Property', entity: 'DPDM LLC', vertical: 'JOP', primaryContact: 'Property Accountant', email: 'ap@example.invalid', totalOutstanding: 73_880_000, overdueAmount: 41_100_000, amount90: 16_760_000, amount180: 5_480_000, unappliedReceipts: 980_000, riskScore: 69, eclExposure: 3_610_000, lastPaymentDate: '2026-05-26', lastContactDate: '2026-06-13', nextFollowUpDate: '2026-06-24' },
  { id: 'cust-emirates-hills', number: 'C-24190', name: 'Emirates Hills Community Corp', entity: 'Community Corp LLC', vertical: 'Residential', primaryContact: 'Board Treasurer', email: 'ap@example.invalid', totalOutstanding: 34_420_000, overdueAmount: 14_380_000, amount90: 5_900_000, amount180: 1_240_000, unappliedReceipts: 420_000, riskScore: 51, eclExposure: 880_000, lastPaymentDate: '2026-06-05', lastContactDate: '2026-06-18', nextFollowUpDate: '2026-06-26' }
];

export const receivables: Receivable[] = [
  { id: 'rec-001', customerId: 'cust-marina-master', customerName: 'Marina District Master Community', customerNumber: 'C-24044', entity: 'DCM', transactionNumber: 'AR-INV-26000491', transactionDescription: 'Q2 management fee billing - Marina District', invoiceDate: '2026-02-28', dueDate: '2026-03-30', daysLate: 86, originalAmount: 31_200_000, appliedAmount: 7_400_000, amountDue: 23_800_000, category: 'Management Fees', owner: 'Aisha Khan', status: 'Promise To Pay', risk: 'High', bucket: '61-90', lastContactDate: '2026-06-18', nextActionDate: '2026-06-24', promiseToPayDate: '2026-06-30', notes: 'Customer confirmed treasury approval is pending.' },
  { id: 'rec-002', customerId: 'cust-marina-master', customerName: 'Marina District Master Community', customerNumber: 'C-24044', entity: 'DCM', transactionNumber: 'AR-INV-26000208', transactionDescription: 'Community cost recovery allocation', invoiceDate: '2025-12-15', dueDate: '2026-01-14', daysLate: 161, originalAmount: 18_900_000, appliedAmount: 0, amountDue: 18_900_000, category: 'Cost Recovery / JOPs', owner: 'Aisha Khan', status: 'Disputed', risk: 'Critical', bucket: '91-180', lastContactDate: '2026-06-17', nextActionDate: '2026-06-24', notes: 'SOA mismatch raised by customer; dispute case open.' },
  { id: 'rec-003', customerId: 'cust-palm-residences', customerName: 'Palm Residences Service Charges', customerNumber: 'C-24077', entity: 'NCM', transactionNumber: 'AR-INV-25009877', transactionDescription: 'Annual service charge true-up', invoiceDate: '2025-09-30', dueDate: '2025-10-30', daysLate: 238, originalAmount: 22_600_000, appliedAmount: 4_200_000, amountDue: 18_400_000, category: 'Management Fees', owner: 'Rohan Menon', status: 'Legal Review', risk: 'Critical', bucket: '181-360', lastContactDate: '2026-06-16', nextActionDate: '2026-06-25', notes: 'Legal notice pack under finance manager review.' },
  { id: 'rec-004', customerId: 'cust-park-estates', customerName: 'Park Estates Owners Association', customerNumber: 'C-24018', entity: 'DHCM', transactionNumber: 'AR-INV-26000312', transactionDescription: 'NOC and non-management service fees', invoiceDate: '2026-01-31', dueDate: '2026-03-01', daysLate: 115, originalAmount: 12_750_000, appliedAmount: 1_900_000, amountDue: 10_850_000, category: 'Non-Management / NOC', owner: 'Maha Youssef', status: 'Open', risk: 'High', bucket: '91-180', lastContactDate: '2026-06-15', nextActionDate: '2026-06-24', notes: 'Awaiting customer payment plan response.' },
  { id: 'rec-005', customerId: 'cust-business-bay', customerName: 'Business Bay Community Jointly Owned Property', customerNumber: 'C-24132', entity: 'DPDM LLC', transactionNumber: 'AR-INV-25007110', transactionDescription: 'Prior year JOP cost recovery', invoiceDate: '2025-03-31', dueDate: '2025-05-15', daysLate: 405, originalAmount: 9_250_000, appliedAmount: 0, amountDue: 9_250_000, category: 'Cost Recovery / JOPs', owner: 'Omar Haddad', status: 'Legal Review', risk: 'Critical', bucket: '361+', lastContactDate: '2026-06-13', nextActionDate: '2026-06-24', notes: 'Escalated due to age and unresolved LPO challenge.' },
  { id: 'rec-006', customerId: 'cust-creek-retail', customerName: 'Creek Retail Facilities LLC', customerNumber: 'C-24110', entity: 'DPCM LLC', transactionNumber: 'AR-INV-26000640', transactionDescription: 'Retail facilities management fees', invoiceDate: '2026-05-31', dueDate: '2026-06-30', daysLate: 0, originalAmount: 14_800_000, appliedAmount: 0, amountDue: 14_800_000, category: 'Management Fees', owner: 'Leena Shah', status: 'Open', risk: 'Low', bucket: 'Current', lastContactDate: '2026-06-14', nextActionDate: '2026-06-28', notes: 'Current balance, no exception.' },
  { id: 'rec-007', customerId: 'cust-emirates-hills', customerName: 'Emirates Hills Community Corp', customerNumber: 'C-24190', entity: 'Community Corp LLC', transactionNumber: 'AR-INV-26000514', transactionDescription: 'Community service charges and admin recovery', invoiceDate: '2026-04-30', dueDate: '2026-05-30', daysLate: 25, originalAmount: 7_900_000, appliedAmount: 2_000_000, amountDue: 5_900_000, category: 'Other', owner: 'Noor Alawi', status: 'Partially Paid', risk: 'Medium', bucket: '1-30', lastContactDate: '2026-06-18', nextActionDate: '2026-06-26', notes: 'Partial payment received; balance expected next cycle.' },
  { id: 'rec-008', customerId: 'cust-park-estates', customerName: 'Park Estates Owners Association', customerNumber: 'C-24018', entity: 'DHCM', transactionNumber: 'AR-INV-26000440', transactionDescription: 'Shared services recovery', invoiceDate: '2026-04-15', dueDate: '2026-05-15', daysLate: 40, originalAmount: 16_600_000, appliedAmount: 0, amountDue: 16_600_000, category: 'Cost Recovery / JOPs', owner: 'Maha Youssef', status: 'Open', risk: 'Medium', bucket: '31-60', lastContactDate: '2026-06-17', nextActionDate: '2026-06-27', notes: 'First reminder sent by operations team outside this app.' }
];

export const invoices: Invoice[] = receivables.map((record) => ({
  id: record.id.replace('rec', 'inv'),
  customerId: record.customerId,
  transactionNumber: record.transactionNumber,
  dueDate: record.dueDate,
  daysLate: record.daysLate,
  bucket: record.bucket,
  amountDue: record.amountDue,
  status: record.status === 'Disputed' ? 'disputed' : record.status === 'Partially Paid' ? 'partially_paid' : 'open'
}));

export const collections: CollectionAccount[] = [
  { id: 'col-001', customerId: 'cust-marina-master', customerName: 'Marina District Master Community', entity: 'DCM', owner: 'Aisha Khan', priority: 'Today', exposure: 61_320_000, overdue90: 27_900_000, followUpStatus: 'Promise To Pay', lastContactDate: '2026-06-18', nextActionDate: '2026-06-24', promiseToPayDate: '2026-06-30', escalationStatus: 'Finance Manager', paymentPlan: true, legalEscalation: false, notes: ['PTP date confirmed verbally', 'Payment plan approval requested'] },
  { id: 'col-002', customerId: 'cust-palm-residences', customerName: 'Palm Residences Service Charges', entity: 'NCM', owner: 'Rohan Menon', priority: 'Today', exposure: 52_750_000, overdue90: 22_600_000, followUpStatus: 'Legal Review', lastContactDate: '2026-06-16', nextActionDate: '2026-06-25', escalationStatus: 'Legal', paymentPlan: false, legalEscalation: true, notes: ['Legal notice pack in review', 'Board approval pending'] },
  { id: 'col-003', customerId: 'cust-park-estates', customerName: 'Park Estates Owners Association', entity: 'DHCM', owner: 'Maha Youssef', priority: 'This Week', exposure: 36_180_000, overdue90: 18_420_000, followUpStatus: 'Contacted', lastContactDate: '2026-06-15', nextActionDate: '2026-06-24', escalationStatus: 'None', paymentPlan: false, legalEscalation: false, notes: ['Awaiting response on NOC fees', 'Escalate if no response by 26 Jun'] },
  { id: 'col-004', customerId: 'cust-business-bay', customerName: 'Business Bay Community Jointly Owned Property', entity: 'DPDM LLC', owner: 'Omar Haddad', priority: 'Today', exposure: 41_100_000, overdue90: 16_760_000, followUpStatus: 'Escalated', lastContactDate: '2026-06-13', nextActionDate: '2026-06-24', escalationStatus: 'Executive', paymentPlan: false, legalEscalation: true, notes: ['LPO issue unresolved', 'Executive escalation scheduled'] }
];

export const allocations: AllocationReceipt[] = [
  { id: 'alloc-001', bankAccount: 'ENBD Operating AED', receiptDate: '2026-06-18', bankReference: 'ENBD/FT/887210', proofReference: 'POP-MARINA-491', customerHint: 'Marina District', amount: 7_400_000, suggestedCustomer: 'Marina District Master Community', suggestedInvoice: 'AR-INV-26000491', confidence: 96, matchReason: 'Reference number and customer name match; amount equals applied amount.', status: 'Suggested Match' },
  { id: 'alloc-002', bankAccount: 'Mashreq Collections AED', receiptDate: '2026-06-17', bankReference: 'MASH/CR/442110', proofReference: 'Bulk receipt - Palm', customerHint: 'Palm service charges', amount: 5_800_000, suggestedCustomer: 'Palm Residences Service Charges', suggestedInvoice: 'Multiple invoices', confidence: 72, matchReason: 'Same customer and close aggregate amount; partial payment likely.', status: 'Partially Matched' },
  { id: 'alloc-003', bankAccount: 'ADCB Receipts AED', receiptDate: '2026-06-16', bankReference: 'ADCB/UNALLOC/1049', proofReference: 'No proof received', customerHint: 'Unknown remitter', amount: 2_900_000, suggestedCustomer: 'Manual review required', suggestedInvoice: 'Unidentified', confidence: 28, matchReason: 'No reference or customer match; proof of payment missing.', status: 'Unidentified' },
  { id: 'alloc-004', bankAccount: 'ENBD Operating AED', receiptDate: '2026-06-14', bankReference: 'ENBD/FT/884012', proofReference: 'POP-CREEK-640', customerHint: 'Creek Retail', amount: 1_250_000, suggestedCustomer: 'Creek Retail Facilities LLC', suggestedInvoice: 'AR-INV-26000640', confidence: 68, matchReason: 'Same customer but amount indicates possible partial payment.', status: 'Manual Review' }
];

export const disputes: DisputeCase[] = [
  { id: 'DSP-1007', type: 'SOA mismatch', status: 'Under Review', owner: 'Aisha Khan', customerName: 'Marina District Master Community', entity: 'DCM', linkedInvoice: 'AR-INV-26000208', amountBlocked: 18_900_000, openedDate: '2026-05-29', ageDays: 26, slaStatus: 'Due Soon', timeline: ['Customer shared alternate SOA on 29 May', 'Billing team reviewing applied credit notes', 'Finance manager review due 24 Jun'] },
  { id: 'DSP-1012', type: 'Contract / LPO issue', status: 'Escalated', owner: 'Omar Haddad', customerName: 'Business Bay Community Jointly Owned Property', entity: 'DPDM LLC', linkedInvoice: 'AR-INV-25007110', amountBlocked: 9_250_000, openedDate: '2026-04-12', ageDays: 73, slaStatus: 'Breached', timeline: ['Customer disputes LPO reference', 'Legal escalation opened', 'Executive decision required'] },
  { id: 'DSP-1018', type: 'Tax invoice issue', status: 'Waiting for Internal Team', owner: 'Leena Shah', customerName: 'Creek Retail Facilities LLC', entity: 'DPCM LLC', linkedInvoice: 'AR-INV-26000640', amountBlocked: 3_200_000, openedDate: '2026-06-10', ageDays: 14, slaStatus: 'On Track', timeline: ['Tax team requested corrected TRN mapping', 'Customer waiting for revised tax invoice'] }
];

export const treasuryPositions: TreasuryPosition[] = [
  { id: 'tre-001', entity: 'DHCM', date: '2026-06-24', expectedCollections: 42_600_000, confirmedReceipts: 18_800_000, unallocatedReceipts: 2_600_000, bankConfirmationPending: 4_400_000, forecast7Days: 57_300_000, forecast30Days: 168_000_000 },
  { id: 'tre-002', entity: 'NCM', date: '2026-06-24', expectedCollections: 38_200_000, confirmedReceipts: 21_500_000, unallocatedReceipts: 5_800_000, bankConfirmationPending: 6_100_000, forecast7Days: 63_900_000, forecast30Days: 142_300_000 },
  { id: 'tre-003', entity: 'DCM', date: '2026-06-24', expectedCollections: 55_900_000, confirmedReceipts: 27_700_000, unallocatedReceipts: 3_450_000, bankConfirmationPending: 8_200_000, forecast7Days: 78_100_000, forecast30Days: 194_600_000 },
  { id: 'tre-004', entity: 'DPCM LLC', date: '2026-06-24', expectedCollections: 19_300_000, confirmedReceipts: 11_100_000, unallocatedReceipts: 1_250_000, bankConfirmationPending: 2_800_000, forecast7Days: 24_400_000, forecast30Days: 71_200_000 }
];

export const controls: ControlItem[] = [
  { id: 'ctl-001', area: 'Month-end close', control: 'AR aging sign-off by entity controller', owner: 'Finance Control', dueDate: '2026-06-28', status: 'In Progress', evidenceStatus: 'Uploaded', exceptions: 3 },
  { id: 'ctl-002', area: 'Subledger to GL', control: 'AR subledger to GL reconciliation', owner: 'Record to Report', dueDate: '2026-06-29', status: 'Pending Evidence', evidenceStatus: 'Requested', exceptions: 2 },
  { id: 'ctl-003', area: 'Cash allocation', control: 'Unapplied cash review above AED 250k', owner: 'O2C Operations', dueDate: '2026-06-26', status: 'Reviewed', evidenceStatus: 'Reviewed', exceptions: 4 },
  { id: 'ctl-004', area: 'Provision review', control: 'ECL exposure and 90+ provision review', owner: 'Financial Reporting', dueDate: '2026-06-30', status: 'Not Started', evidenceStatus: 'Missing', exceptions: 5 },
  { id: 'ctl-005', area: 'Legal escalation', control: 'Legal and dispute escalation review', owner: 'Collections Lead', dueDate: '2026-06-27', status: 'In Progress', evidenceStatus: 'Uploaded', exceptions: 2 }
];

export const reportDefinitions: ReportDefinition[] = [
  { id: 'aging-summary', title: 'Aging summary', description: 'Outstanding AR by aging bucket.', rows: [] },
  { id: 'entity-summary', title: 'Entity summary', description: 'Total and overdue exposure by DHCM entity.', rows: [] },
  { id: 'category-summary', title: 'Category summary', description: 'Exposure by billing category.', rows: [] },
  { id: 'ninety-matrix', title: '90+ matrix', description: '91+ exposure by entity and risk.', rows: [] },
  { id: 'collector-performance', title: 'Collector performance', description: 'Queue ownership and escalation status.', rows: [] },
  { id: 'dispute-aging', title: 'Dispute aging', description: 'Blocked amounts and SLA status.', rows: [] },
  { id: 'cash-allocation', title: 'Cash allocation report', description: 'Unapplied receipts and suggested matches.', rows: [] },
  { id: 'control-pack', title: 'Month-end control pack', description: 'Control readiness and evidence status.', rows: [] }
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
    id: 'import-oracle-jun',
    fileName: 'Oracle_AR_Aging_June_2026.xlsx',
    uploadedAt: '2026-06-24T08:00:00+04:00',
    status: 'review_required',
    missingColumns: validateOracleArColumns(oracleMayUploadedColumns),
    failedRows: 11,
    validRows: 2146,
    notes: ['6 rows contain invalid due dates', '3 rows have negative amount due remaining', '2 rows map to unknown entity codes']
  }
];

export const agentActions: AgentAction[] = [
  { id: 'act-001', title: 'Draft follow-up pack for 91+ invoices above AED 5M', description: 'Draft-only customer follow-up packets are prepared for finance review.', status: 'pending_approval', riskLevel: 'medium', createdAt: '2026-06-24T09:15:00+04:00' },
  { id: 'act-002', title: 'Escalate breached dispute SLA', description: 'Business Bay contract/LPO dispute requires legal and executive review.', status: 'draft', riskLevel: 'high', createdAt: '2026-06-24T09:35:00+04:00' }
];

export function formatAed(value: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
