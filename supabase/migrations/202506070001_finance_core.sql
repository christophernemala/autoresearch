create schema if not exists finance;
create extension if not exists pgcrypto with schema extensions;

create type finance.user_role as enum ('Admin', 'Finance User', 'Viewer');
create type finance.agent_action_status as enum ('draft', 'pending_approval', 'approved', 'rejected', 'executed', 'failed', 'cancelled');
create type finance.reconciliation_status as enum ('matched', 'unmatched', 'partially_matched', 'review_required');

create table finance.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role finance.user_role not null default 'Viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table finance.entities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  currency text not null default 'AED',
  timezone text not null default 'Asia/Dubai',
  created_at timestamptz not null default now()
);

create table finance.customers (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references finance.entities(id),
  customer_number text not null unique,
  customer_name text not null,
  customer_vertical text,
  bill_to_location text,
  primary_contact_name text,
  primary_contact_email text,
  risk_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table finance.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  transaction_source text,
  transaction_type text,
  transaction_number text not null unique,
  transaction_description text,
  gl_date date,
  transaction_date date,
  due_date date,
  days_late integer not null default 0,
  original_invoice_amount numeric(18,2) not null default 0,
  applied_amount numeric(18,2) not null default 0,
  amount_due_remaining numeric(18,2) not null default 0,
  aging_bucket text not null default 'Current',
  status text not null default 'open',
  oracle_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table finance.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references finance.customers(id),
  payment_reference text not null,
  payment_date date not null,
  amount numeric(18,2) not null,
  unapplied_amount numeric(18,2) not null default 0,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table finance.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references finance.invoices(id),
  payment_id uuid not null references finance.payments(id),
  applied_amount numeric(18,2) not null,
  created_at timestamptz not null default now()
);

create table finance.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references finance.entities(id),
  bank_name text not null,
  account_name text not null,
  currency text not null default 'AED',
  masked_account_number text,
  created_at timestamptz not null default now()
);

create table finance.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  bank_account_id uuid references finance.bank_accounts(id),
  transaction_date date not null,
  reference text not null,
  amount numeric(18,2) not null,
  status finance.reconciliation_status not null default 'unmatched',
  confidence_score numeric(5,2) not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table finance.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  bank_transaction_id uuid not null references finance.bank_transactions(id),
  payment_id uuid references finance.payments(id),
  invoice_id uuid references finance.invoices(id),
  status finance.reconciliation_status not null default 'review_required',
  confidence_score numeric(5,2) not null default 0,
  proposed_by text not null default 'system',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table finance.customer_documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  document_type text not null,
  storage_path text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table finance.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  name text not null,
  email text,
  phone text,
  role text,
  created_at timestamptz not null default now()
);

create table finance.soa_documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  status text not null default 'draft',
  pdf_path text,
  excel_path text,
  generated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table finance.customer_email_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references finance.customers(id),
  subject text not null,
  body text not null,
  status text not null default 'draft',
  approved_by uuid references auth.users(id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table finance.disputes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  invoice_id uuid references finance.invoices(id),
  status text not null default 'open',
  reason text not null,
  created_at timestamptz not null default now()
);

create table finance.promises (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  promised_amount numeric(18,2) not null,
  promised_date date not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table finance.collections_actions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references finance.customers(id),
  action_type text not null,
  status text not null default 'draft',
  assigned_to uuid references auth.users(id),
  due_date date,
  created_at timestamptz not null default now()
);

create table finance.reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table finance.export_jobs (
  id uuid primary key default gen_random_uuid(),
  export_type text not null,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  file_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table finance.oracle_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text not null,
  source_file_name text,
  row_count integer not null default 0,
  failed_row_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table finance.mcp_tools (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null unique,
  purpose text not null,
  connection_status text not null default 'setup_required',
  required_environment_variables text[] not null default '{}',
  last_checked_at timestamptz,
  setup_notes text,
  created_at timestamptz not null default now()
);

create table finance.api_key_metadata (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  key_label text not null,
  storage_location text not null,
  last_rotated_at timestamptz,
  created_at timestamptz not null default now()
);

create table finance.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table finance.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  route text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table finance.agent_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references finance.agent_sessions(id) on delete cascade,
  page_context jsonb not null,
  selected_customer_id uuid,
  selected_entity text,
  selected_report_id uuid,
  selected_import_id uuid,
  selected_reconciliation_item_id uuid,
  created_at timestamptz not null default now()
);

create table finance.agent_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references finance.agent_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  context_snapshot_id uuid references finance.agent_context_snapshots(id),
  created_at timestamptz not null default now()
);

create table finance.agent_actions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references finance.agent_sessions(id),
  title text not null,
  proposed_action text not null,
  status finance.agent_action_status not null default 'draft',
  risk_level text not null default 'low',
  execution_result jsonb not null default '{}'::jsonb,
  audit_log_id uuid references finance.audit_logs(id),
  created_at timestamptz not null default now()
);

create table finance.agent_action_approvals (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references finance.agent_actions(id) on delete cascade,
  approval_status finance.agent_action_status not null default 'pending_approval',
  approved_by uuid references auth.users(id),
  approval_note text,
  created_at timestamptz not null default now()
);

alter table finance.user_profiles enable row level security;
alter table finance.entities enable row level security;
alter table finance.customers enable row level security;
alter table finance.invoices enable row level security;
alter table finance.payments enable row level security;
alter table finance.invoice_payments enable row level security;
alter table finance.bank_accounts enable row level security;
alter table finance.bank_transactions enable row level security;
alter table finance.reconciliation_matches enable row level security;
alter table finance.customer_documents enable row level security;
alter table finance.customer_contacts enable row level security;
alter table finance.soa_documents enable row level security;
alter table finance.customer_email_logs enable row level security;
alter table finance.disputes enable row level security;
alter table finance.promises enable row level security;
alter table finance.collections_actions enable row level security;
alter table finance.reports enable row level security;
alter table finance.export_jobs enable row level security;
alter table finance.oracle_sync_logs enable row level security;
alter table finance.mcp_tools enable row level security;
alter table finance.api_key_metadata enable row level security;
alter table finance.audit_logs enable row level security;
alter table finance.agent_sessions enable row level security;
alter table finance.agent_context_snapshots enable row level security;
alter table finance.agent_messages enable row level security;
alter table finance.agent_actions enable row level security;
alter table finance.agent_action_approvals enable row level security;

create policy "authenticated finance read placeholder" on finance.entities for select to authenticated using (true);
create policy "authenticated customer read placeholder" on finance.customers for select to authenticated using (true);
create policy "authenticated invoice read placeholder" on finance.invoices for select to authenticated using (true);
create policy "users read own profile placeholder" on finance.user_profiles for select to authenticated using (id = auth.uid());
create policy "agent session owner placeholder" on finance.agent_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
