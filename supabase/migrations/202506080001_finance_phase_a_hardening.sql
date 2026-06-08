alter table finance.entities
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.customers
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.invoices
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.payments
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.bank_transactions
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.reconciliation_matches
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.soa_documents
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.customer_email_logs
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.disputes
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.promises
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.collections_actions
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

alter table finance.agent_actions
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id);

create or replace function finance.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from finance.user_profiles
    where id = auth.uid()
      and role = 'Admin'
  );
$$;

create policy "admin full access placeholder" on finance.audit_logs
  for select to authenticated using (finance.is_admin());

grant usage on schema finance to authenticated;
grant select, insert, update on all tables in schema finance to authenticated;

create policy "authenticated payment read placeholder" on finance.payments
  for select to authenticated using (true);
create policy "authenticated invoice payment read placeholder" on finance.invoice_payments
  for select to authenticated using (true);
create policy "authenticated bank account read placeholder" on finance.bank_accounts
  for select to authenticated using (true);
create policy "authenticated bank transaction read placeholder" on finance.bank_transactions
  for select to authenticated using (true);
create policy "authenticated reconciliation read placeholder" on finance.reconciliation_matches
  for select to authenticated using (true);
create policy "authenticated document read placeholder" on finance.customer_documents
  for select to authenticated using (true);
create policy "authenticated contact read placeholder" on finance.customer_contacts
  for select to authenticated using (true);
create policy "authenticated soa read placeholder" on finance.soa_documents
  for select to authenticated using (true);
create policy "authenticated email log read placeholder" on finance.customer_email_logs
  for select to authenticated using (true);
create policy "authenticated dispute read placeholder" on finance.disputes
  for select to authenticated using (true);
create policy "authenticated promise read placeholder" on finance.promises
  for select to authenticated using (true);
create policy "authenticated collection action read placeholder" on finance.collections_actions
  for select to authenticated using (true);
create policy "authenticated report read placeholder" on finance.reports
  for select to authenticated using (true);
create policy "authenticated export job read placeholder" on finance.export_jobs
  for select to authenticated using (true);
create policy "authenticated oracle sync read placeholder" on finance.oracle_sync_logs
  for select to authenticated using (true);
create policy "authenticated mcp tool read placeholder" on finance.mcp_tools
  for select to authenticated using (true);
create policy "authenticated agent context read placeholder" on finance.agent_context_snapshots
  for select to authenticated using (true);
create policy "authenticated agent message read placeholder" on finance.agent_messages
  for select to authenticated using (true);
create policy "authenticated agent action read placeholder" on finance.agent_actions
  for select to authenticated using (true);
create policy "authenticated agent approval read placeholder" on finance.agent_action_approvals
  for select to authenticated using (true);

create policy "authenticated audit append placeholder" on finance.audit_logs
  for insert to authenticated with check (actor_id = auth.uid());
create policy "authenticated agent action draft placeholder" on finance.agent_actions
  for insert to authenticated with check (created_by = auth.uid() or created_by is null);
create policy "authenticated agent approval create placeholder" on finance.agent_action_approvals
  for insert to authenticated with check (approved_by = auth.uid());

create index if not exists idx_customers_entity_id on finance.customers(entity_id);
create index if not exists idx_customers_risk_score on finance.customers(risk_score);
create index if not exists idx_invoices_customer_id on finance.invoices(customer_id);
create index if not exists idx_invoices_status on finance.invoices(status);
create index if not exists idx_invoices_aging_bucket on finance.invoices(aging_bucket);
create index if not exists idx_invoices_days_late on finance.invoices(days_late);
create index if not exists idx_invoices_created_at on finance.invoices(created_at);
create index if not exists idx_payments_customer_id on finance.payments(customer_id);
create index if not exists idx_payments_status on finance.payments(status);
create index if not exists idx_invoice_payments_invoice_id on finance.invoice_payments(invoice_id);
create index if not exists idx_invoice_payments_payment_id on finance.invoice_payments(payment_id);
create index if not exists idx_bank_accounts_entity_id on finance.bank_accounts(entity_id);
create index if not exists idx_bank_transactions_status on finance.bank_transactions(status);
create index if not exists idx_bank_transactions_created_at on finance.bank_transactions(created_at);
create index if not exists idx_reconciliation_matches_status on finance.reconciliation_matches(status);
create index if not exists idx_reconciliation_matches_invoice_id on finance.reconciliation_matches(invoice_id);
create index if not exists idx_customer_documents_customer_id on finance.customer_documents(customer_id);
create index if not exists idx_customer_contacts_customer_id on finance.customer_contacts(customer_id);
create index if not exists idx_soa_documents_customer_id on finance.soa_documents(customer_id);
create index if not exists idx_customer_email_logs_customer_id on finance.customer_email_logs(customer_id);
create index if not exists idx_disputes_customer_id on finance.disputes(customer_id);
create index if not exists idx_disputes_invoice_id on finance.disputes(invoice_id);
create index if not exists idx_promises_customer_id on finance.promises(customer_id);
create index if not exists idx_collections_actions_customer_id on finance.collections_actions(customer_id);
create index if not exists idx_collections_actions_status on finance.collections_actions(status);
create index if not exists idx_reports_status on finance.reports(status);
create index if not exists idx_export_jobs_status on finance.export_jobs(status);
create index if not exists idx_oracle_sync_logs_created_at on finance.oracle_sync_logs(created_at);
create index if not exists idx_audit_logs_created_at on finance.audit_logs(created_at);
create index if not exists idx_agent_sessions_user_id on finance.agent_sessions(user_id);
create index if not exists idx_agent_messages_session_id on finance.agent_messages(session_id);
create index if not exists idx_agent_actions_status on finance.agent_actions(status);
create index if not exists idx_agent_actions_created_at on finance.agent_actions(created_at);
