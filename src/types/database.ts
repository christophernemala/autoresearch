export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type FinanceRole = 'Admin' | 'Finance User' | 'Viewer';
export type AgingBucket = 'Current' | '1-30' | '31-60' | '61-90' | '91-180' | '181-360' | '361+';
export type ReconciliationStatus = 'matched' | 'unmatched' | 'partially_matched' | 'review_required';
export type AgentActionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'failed'
  | 'cancelled';

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  finance: {
    Tables: {
      user_profiles: Table<{
        id: string;
        email: string;
        full_name: string | null;
        role: FinanceRole;
        created_at: string;
      }>;
      entities: Table<{
        id: string;
        code: string;
        name: string;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      customers: Table<{
        id: string;
        entity_id: string | null;
        customer_number: string;
        customer_name: string;
        customer_vertical: string | null;
        bill_to_location: string | null;
        primary_contact_name: string | null;
        primary_contact_email: string | null;
        risk_score: number | null;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      invoices: Table<{
        id: string;
        customer_id: string | null;
        transaction_source: string | null;
        transaction_type: string | null;
        transaction_number: string;
        transaction_description: string | null;
        gl_date: string | null;
        transaction_date: string | null;
        due_date: string | null;
        days_late: number | null;
        original_invoice_amount: number;
        applied_amount: number;
        amount_due_remaining: number;
        currency: string;
        aging_bucket: AgingBucket;
        status: string;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      payments: Table<{
        id: string;
        customer_id: string | null;
        payment_reference: string;
        payment_date: string | null;
        amount: number;
        unapplied_amount: number;
        currency: string;
        status: string;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      bank_transactions: Table<{
        id: string;
        bank_account_id: string | null;
        transaction_date: string;
        reference: string;
        amount: number;
        currency: string;
        status: ReconciliationStatus;
        confidence_score: number | null;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      reconciliation_matches: Table<{
        id: string;
        bank_transaction_id: string | null;
        payment_id: string | null;
        invoice_id: string | null;
        status: ReconciliationStatus;
        confidence_score: number | null;
        proposed_by: string | null;
        approved_by: string | null;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      customer_documents: Table<{
        id: string;
        customer_id: string | null;
        file_name: string;
        mime_type: string | null;
        size_bytes: number | null;
        storage_path: string | null;
        created_at: string;
      }>;
      soa_documents: Table<{
        id: string;
        customer_id: string | null;
        period_start: string | null;
        period_end: string | null;
        status: string;
        storage_path: string | null;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      audit_logs: Table<{
        id: string;
        actor_id: string | null;
        action: string;
        resource_type: string;
        resource_id: string | null;
        changes: Json;
        created_at: string;
      }>;
      agent_sessions: Table<{
        id: string;
        user_id: string | null;
        route: string | null;
        title: string;
        created_at: string;
      }>;
      agent_messages: Table<{
        id: string;
        session_id: string | null;
        role: 'user' | 'assistant' | 'system';
        content: string;
        context: Json;
        created_at: string;
      }>;
      agent_actions: Table<{
        id: string;
        session_id: string | null;
        action_type: string;
        title: string;
        payload: Json;
        status: AgentActionStatus;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
      }>;
      agent_action_approvals: Table<{
        id: string;
        action_id: string | null;
        approved_by: string | null;
        status: AgentActionStatus;
        notes: string | null;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      finance_role: FinanceRole;
      aging_bucket: AgingBucket;
      reconciliation_status: ReconciliationStatus;
      agent_action_status: AgentActionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
