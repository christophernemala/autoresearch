export type Role = 'Admin' | 'Finance User' | 'Viewer';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  source: 'local_review' | 'supabase';
}

export type AgingBucket = 'Current' | '1-30' | '31-60' | '61-90' | '91-180' | '181-360' | '361+';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReceivableStatus = 'Open' | 'Partially Paid' | 'Disputed' | 'Promise To Pay' | 'Legal Review' | 'On Hold';
export type ReceivableCategory = 'Management Fees' | 'Non-Management / NOC' | 'Cost Recovery / JOPs' | 'Other';
export type FollowUpStatus = 'Not Started' | 'Contacted' | 'Promise To Pay' | 'Escalated' | 'Legal Review' | 'Blocked';
export type AllocationStatus = 'Suggested Match' | 'Partially Matched' | 'Manual Review' | 'Unidentified' | 'Allocated';
export type DisputeStatus = 'New' | 'Under Review' | 'Waiting for Customer' | 'Waiting for Internal Team' | 'Resolved' | 'Escalated';
export type DisputeType =
  | 'Billing dispute'
  | 'Short payment'
  | 'Missing invoice'
  | 'Wrong customer mapping'
  | 'Tax invoice issue'
  | 'SOA mismatch'
  | 'Contract / LPO issue'
  | 'Portal upload issue';
export type ControlStatus = 'Not Started' | 'In Progress' | 'Pending Evidence' | 'Reviewed' | 'Signed Off';
export type EvidenceStatus = 'Missing' | 'Requested' | 'Uploaded' | 'Reviewed';
export type SlaStatus = 'On Track' | 'Due Soon' | 'Breached';

export interface EntityAging {
  entity: string;
  legalName: string;
  totalAr: number;
  current: number;
  overdue: number;
  critical90: number;
  critical180: number;
  dso: number;
  cei: number;
  eclProvision: number;
}

export interface Customer {
  id: string;
  number: string;
  name: string;
  entity: string;
  vertical: string;
  primaryContact: string;
  email: string;
  totalOutstanding: number;
  overdueAmount: number;
  amount90: number;
  amount180: number;
  unappliedReceipts: number;
  riskScore: number;
  eclExposure: number;
  lastPaymentDate: string;
  lastContactDate: string;
  nextFollowUpDate: string;
}

export interface Receivable {
  id: string;
  customerId: string;
  customerName: string;
  customerNumber: string;
  entity: string;
  transactionNumber: string;
  transactionDescription: string;
  invoiceDate: string;
  dueDate: string;
  daysLate: number;
  originalAmount: number;
  appliedAmount: number;
  amountDue: number;
  category: ReceivableCategory;
  owner: string;
  status: ReceivableStatus;
  risk: RiskLevel;
  bucket: AgingBucket;
  lastContactDate: string;
  nextActionDate: string;
  promiseToPayDate?: string;
  notes: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  transactionNumber: string;
  dueDate: string;
  daysLate: number;
  bucket: AgingBucket;
  amountDue: number;
  status: 'open' | 'disputed' | 'partially_paid' | 'paid';
}

export interface CollectionAccount {
  id: string;
  customerId: string;
  customerName: string;
  entity: string;
  owner: string;
  priority: 'Today' | 'This Week' | 'Monitor';
  exposure: number;
  overdue90: number;
  followUpStatus: FollowUpStatus;
  lastContactDate: string;
  nextActionDate: string;
  promiseToPayDate?: string;
  escalationStatus: 'None' | 'Finance Manager' | 'Legal' | 'Executive';
  paymentPlan: boolean;
  legalEscalation: boolean;
  notes: string[];
}

export interface AllocationReceipt {
  id: string;
  bankAccount: string;
  receiptDate: string;
  bankReference: string;
  proofReference: string;
  customerHint: string;
  amount: number;
  suggestedCustomer: string;
  suggestedInvoice: string;
  confidence: number;
  matchReason: string;
  status: AllocationStatus;
}

export interface BankTransaction {
  id: string;
  bankAccount: string;
  date: string;
  reference: string;
  customerHint: string;
  amount: number;
  status: 'matched' | 'unmatched' | 'partially_matched' | 'review_required';
  confidence: number;
}

export interface DisputeCase {
  id: string;
  type: DisputeType;
  status: DisputeStatus;
  owner: string;
  customerName: string;
  entity: string;
  linkedInvoice: string;
  amountBlocked: number;
  openedDate: string;
  ageDays: number;
  slaStatus: SlaStatus;
  timeline: string[];
}

export interface TreasuryPosition {
  id: string;
  entity: string;
  date: string;
  expectedCollections: number;
  confirmedReceipts: number;
  unallocatedReceipts: number;
  bankConfirmationPending: number;
  forecast7Days: number;
  forecast30Days: number;
}

export interface ControlItem {
  id: string;
  area: string;
  control: string;
  owner: string;
  dueDate: string;
  status: ControlStatus;
  evidenceStatus: EvidenceStatus;
  exceptions: number;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  rows: Record<string, string | number>[];
}

export interface ImportValidationResult {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: 'validated' | 'failed' | 'review_required';
  missingColumns: string[];
  failedRows: number;
  validRows: number;
  notes: string[];
}

export interface AgentContext {
  route: string;
  title: string;
  selectedCustomerId?: string;
  selectedEntity?: string;
  period?: string;
  displayMode?: string;
  selectedTransactions?: string[];
  importValidationId?: string;
}

export type AgentActionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed' | 'cancelled';

export interface AgentAction {
  id: string;
  title: string;
  description: string;
  status: AgentActionStatus;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}
