export type Role = 'Admin' | 'Finance User' | 'Viewer';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  source: 'local_review' | 'supabase';
}

export type AgingBucket =
  | 'Current'
  | '1-30'
  | '31-60'
  | '61-90'
  | '91-180'
  | '181-360'
  | '361+';

export type AgentActionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'failed'
  | 'cancelled';

export interface EntityAging {
  entity: string;
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

export interface AgentAction {
  id: string;
  title: string;
  description: string;
  status: AgentActionStatus;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}
