import { allocations, collections, controls, customers, disputes, entities, importResults, invoices, receivables, treasuryPositions } from '../data/financeSeed';
import type {
  AllocationReceipt,
  CollectionAccount,
  ControlItem,
  Customer,
  DisputeCase,
  EntityAging,
  ImportValidationResult,
  Invoice,
  Receivable,
  TreasuryPosition
} from '../types';
import { supabase, supabaseConfigured } from './supabaseClient';

export interface FinanceSnapshot {
  source: 'seed' | 'supabase';
  entities: EntityAging[];
  customers: Customer[];
  invoices: Invoice[];
  receivables: Receivable[];
  allocations: AllocationReceipt[];
  collections: CollectionAccount[];
  disputes: DisputeCase[];
  treasuryPositions: TreasuryPosition[];
  controls: ControlItem[];
  importResults: ImportValidationResult[];
}

export const seedFinanceSnapshot: FinanceSnapshot = {
  source: 'seed',
  entities,
  customers,
  invoices,
  receivables,
  allocations,
  collections,
  disputes,
  treasuryPositions,
  controls,
  importResults
};

export async function loadFinanceSnapshot(): Promise<FinanceSnapshot> {
  if (!supabaseConfigured || !supabase) {
    return seedFinanceSnapshot;
  }

  const finance = supabase.schema('finance');
  const [
    { data: entityRows, error: entityError },
    { data: customerRows, error: customerError },
    { data: invoiceRows, error: invoiceError }
  ] = await Promise.all([
    finance.from('entities').select('id, code'),
    finance.from('customers').select('id, entity_id, customer_number, customer_name, customer_vertical, primary_contact_name, primary_contact_email, risk_score'),
    finance.from('invoices').select('id, customer_id, transaction_number, due_date, days_late, aging_bucket, amount_due_remaining, status')
  ]);

  if (entityError || customerError || invoiceError || !entityRows || !customerRows || !invoiceRows) {
    return seedFinanceSnapshot;
  }

  const entityCodeById = new Map(entityRows.map((entity) => [entity.id, entity.code]));

  return {
    ...seedFinanceSnapshot,
    source: 'supabase',
    customers: customerRows.map((customer) => ({
      id: customer.id,
      number: customer.customer_number,
      name: customer.customer_name,
      entity: customer.entity_id ? entityCodeById.get(customer.entity_id) ?? 'Unmapped' : 'Unmapped',
      vertical: customer.customer_vertical ?? 'Unmapped',
      primaryContact: customer.primary_contact_name ?? 'Not assigned',
      email: customer.primary_contact_email ?? 'not-configured@example.com',
      totalOutstanding: 0,
      overdueAmount: 0,
      amount90: 0,
      amount180: 0,
      unappliedReceipts: 0,
      riskScore: customer.risk_score ?? 0,
      eclExposure: 0,
      lastPaymentDate: 'Pending',
      lastContactDate: 'Pending',
      nextFollowUpDate: 'Pending'
    })),
    invoices: invoiceRows.map((invoice) => ({
      id: invoice.id,
      customerId: invoice.customer_id ?? 'unassigned',
      transactionNumber: invoice.transaction_number,
      dueDate: invoice.due_date ?? 'Pending',
      daysLate: invoice.days_late ?? 0,
      bucket: invoice.aging_bucket,
      amountDue: invoice.amount_due_remaining,
      status: invoice.status as Invoice['status']
    }))
  };
}
