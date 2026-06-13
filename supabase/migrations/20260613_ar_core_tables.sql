create extension if not exists pgcrypto;

create table if not exists ar_customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text unique not null,
  customer_name text not null,
  business_unit text not null,
  contact_email text,
  sla_contract_ref text,
  trade_license_expiry date,
  security_cheque_expiry date,
  risk_rating text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists ar_invoices (
  id uuid primary key default gen_random_uuid(),
  transaction_number text unique not null,
  transaction_description text not null,
  transaction_date date not null,
  gl_date date not null,
  due_date date not null,
  customer_number text not null references ar_customers(customer_number),
  customer_name text not null,
  business_unit text not null,
  original_amount numeric(14,2) not null,
  applied_amount numeric(14,2) not null default 0,
  amount_due_remaining numeric(14,2) generated always as (greatest(original_amount - applied_amount, 0)) stored,
  status text not null default 'OPEN',
  collector_comment text,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bank_statement_lines (
  id uuid primary key default gen_random_uuid(),
  bank_account text not null,
  statement_date date not null,
  bank_reference_number text not null,
  narration text,
  payer_name text,
  amount numeric(14,2) not null,
  currency text not null default 'AED',
  matched_invoice_number text,
  matched_customer_number text,
  match_status text not null default 'UNMATCHED',
  match_confidence numeric(5,2),
  exception_reason text,
  created_at timestamptz not null default now()
);
