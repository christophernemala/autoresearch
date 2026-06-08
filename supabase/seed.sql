insert into finance.entities (code, name) values
  ('DCM', 'Dubai Community Management'),
  ('DPCM', 'Dubai Properties Community Management'),
  ('DPDM', 'Dubai Properties Development Management'),
  ('NCM', 'Nakheel Community Management'),
  ('NPCM', 'Nakheel Palm Community Management')
on conflict (code) do nothing;

insert into finance.customers (entity_id, customer_number, customer_name, customer_vertical, bill_to_location, primary_contact_name, primary_contact_email, risk_score)
select e.id, v.customer_number, v.customer_name, v.customer_vertical, v.bill_to_location, v.primary_contact_name, v.primary_contact_email, v.risk_score
from (
  values
    ('DCM', 'C-10021', 'Emaar Properties PJSC', 'Real Estate', 'Dubai Hills', 'Mariam Al Farsi', 'finance.ap@example.com', 78.0),
    ('DPCM', 'C-10048', 'Meraas Holding', 'Leisure', 'City Walk', 'Omar Haddad', 'collections@example.com', 71.0),
    ('NCM', 'C-10076', 'Nakheel Communities', 'Communities', 'Palm Jumeirah', 'Sara Khan', 'ap.team@example.com', 83.0)
) as v(entity_code, customer_number, customer_name, customer_vertical, bill_to_location, primary_contact_name, primary_contact_email, risk_score)
join finance.entities e on e.code = v.entity_code
on conflict (customer_number) do nothing;

insert into finance.customer_contacts (customer_id, name, email, role)
select c.id, c.primary_contact_name, c.primary_contact_email, 'Accounts Payable'
from finance.customers c
where c.customer_number in ('C-10021', 'C-10048', 'C-10076')
on conflict do nothing;

insert into finance.invoices (customer_id, transaction_source, transaction_type, transaction_number, transaction_description, gl_date, transaction_date, due_date, days_late, original_invoice_amount, applied_amount, amount_due_remaining, aging_bucket, status)
select c.id, v.transaction_source, v.transaction_type, v.transaction_number, v.transaction_description, v.gl_date::date, v.transaction_date::date, v.due_date::date, v.days_late, v.original_invoice_amount, v.applied_amount, v.amount_due_remaining, v.aging_bucket, v.status
from (
  values
    ('C-10021', 'Oracle Fusion AR', 'Trade Receivable', 'AR-INV-9001', 'Community service charges Q1 2025', '2025-01-15', '2025-01-15', '2025-01-15', 116, 12400000.00, 0.00, 12400000.00, '91-180', 'open'),
    ('C-10021', 'Oracle Fusion AR', 'Trade Receivable', 'AR-INV-9002', 'VAT reconciliation adjustment', '2024-11-22', '2024-11-22', '2024-11-22', 170, 9300000.00, 0.00, 9300000.00, '91-180', 'disputed'),
    ('C-10048', 'Oracle Fusion AR', 'Trade Receivable', 'AR-INV-9010', 'Retail district management fees', '2025-02-03', '2025-02-03', '2025-02-03', 97, 17300000.00, 0.00, 17300000.00, '91-180', 'open'),
    ('C-10076', 'Oracle Fusion AR', 'Trade Receivable', 'AR-INV-9025', 'Master community receivable', '2024-10-30', '2024-10-30', '2024-10-30', 193, 18400000.00, 6800000.00, 11600000.00, '181-360', 'partially_paid')
) as v(customer_number, transaction_source, transaction_type, transaction_number, transaction_description, gl_date, transaction_date, due_date, days_late, original_invoice_amount, applied_amount, amount_due_remaining, aging_bucket, status)
join finance.customers c on c.customer_number = v.customer_number
on conflict (transaction_number) do nothing;

insert into finance.payments (customer_id, payment_reference, payment_date, amount, unapplied_amount, status)
select c.id, v.payment_reference, v.payment_date::date, v.amount, v.unapplied_amount, v.status
from (
  values
    ('C-10021', 'TRF EMAAR AR-INV-9001', '2025-05-09', 7200000.00, 0.00, 'received'),
    ('C-10048', 'MERAAS PAYMENT MAY', '2025-05-10', 4600000.00, 0.00, 'partially_applied'),
    ('C-10076', 'UNALLOCATED BULK RECEIPT', '2025-05-11', 2900000.00, 2900000.00, 'unapplied')
) as v(customer_number, payment_reference, payment_date, amount, unapplied_amount, status)
join finance.customers c on c.customer_number = v.customer_number
on conflict do nothing;

insert into finance.disputes (customer_id, invoice_id, status, reason)
select c.id, i.id, 'open', 'VAT reconciliation support requested by customer'
from finance.customers c
join finance.invoices i on i.customer_id = c.id and i.transaction_number = 'AR-INV-9002'
where c.customer_number = 'C-10021'
on conflict do nothing;

insert into finance.promises (customer_id, promised_amount, promised_date, status)
select c.id, 4600000.00, '2025-05-25'::date, 'open'
from finance.customers c
where c.customer_number = 'C-10048'
on conflict do nothing;

insert into finance.soa_documents (customer_id, status)
select c.id, 'draft'
from finance.customers c
where c.customer_number in ('C-10021', 'C-10076')
on conflict do nothing;

insert into finance.customer_email_logs (customer_id, subject, body, status)
select c.id, 'SOA Follow-up - ' || c.customer_name, 'Draft SOA email prepared for approval.', 'draft'
from finance.customers c
where c.customer_number in ('C-10021', 'C-10076')
on conflict do nothing;

insert into finance.bank_accounts (entity_id, bank_name, account_name, currency, masked_account_number)
select e.id, v.bank_name, v.account_name, 'AED', v.masked_account_number
from (
  values
    ('DCM', 'Emirates NBD', 'ENBD Operating AED', '****-2211'),
    ('DPCM', 'Mashreq', 'Mashreq Collections AED', '****-4488'),
    ('NCM', 'ADCB', 'ADCB Receipts AED', '****-9012')
) as v(entity_code, bank_name, account_name, masked_account_number)
join finance.entities e on e.code = v.entity_code
on conflict do nothing;

insert into finance.bank_transactions (bank_account_id, transaction_date, reference, amount, status, confidence_score)
select ba.id, v.transaction_date::date, v.reference, v.amount, v.status::finance.reconciliation_status, v.confidence_score
from (
  values
    ('ENBD Operating AED', '2025-05-09', 'TRF EMAAR AR-INV-9001', 7200000.00, 'review_required', 87.0),
    ('Mashreq Collections AED', '2025-05-10', 'MERAAS PAYMENT MAY', 4600000.00, 'partially_matched', 74.0),
    ('ADCB Receipts AED', '2025-05-11', 'UNALLOCATED BULK RECEIPT', 2900000.00, 'unmatched', 31.0)
) as v(account_name, transaction_date, reference, amount, status, confidence_score)
join finance.bank_accounts ba on ba.account_name = v.account_name
on conflict do nothing;

insert into finance.reconciliation_matches (bank_transaction_id, payment_id, invoice_id, status, confidence_score, proposed_by)
select bt.id, p.id, i.id, 'review_required', 87.0, 'seed_agent'
from finance.bank_transactions bt
join finance.payments p on p.payment_reference = 'TRF EMAAR AR-INV-9001'
join finance.invoices i on i.transaction_number = 'AR-INV-9001'
where bt.reference = 'TRF EMAAR AR-INV-9001'
on conflict do nothing;

insert into finance.collections_actions (customer_id, action_type, status, due_date)
select c.id, '90+ follow-up', 'pending_approval', '2025-05-16'::date
from finance.customers c
where c.customer_number = 'C-10076'
on conflict do nothing;

insert into finance.reports (report_type, parameters, status)
values
  ('AR Aging Report', '{"period":"Q2 2025","currency":"AED"}'::jsonb, 'draft'),
  ('Agent Action Report', '{"period":"Q2 2025"}'::jsonb, 'draft')
on conflict do nothing;

insert into finance.export_jobs (export_type, parameters, status)
values
  ('finance_workbook', '{"period":"Q2 2025","sheets":["Executive Summary","Entity Aging Summary","Invoice Level Details"]}'::jsonb, 'queued')
on conflict do nothing;

insert into finance.oracle_sync_logs (sync_type, status, source_file_name, row_count, failed_row_count, details)
values
  ('excel_import_validation', 'review_required', 'Oracle_AR_Aging_May_2025.xlsx', 1856, 14, '{"missingColumns":["Receivable Code Combination","Sub Account"],"invalidDates":7,"negativeBalances":4}'::jsonb)
on conflict do nothing;

insert into finance.agent_sessions (route, title)
values ('/app/agent', 'AI Finance Agent Command Center')
on conflict do nothing;

insert into finance.agent_messages (session_id, role, content)
select s.id, 'assistant', 'Seed assistant message: 90+ exposure and SOA follow-up drafts are ready for approval.'
from finance.agent_sessions s
where s.route = '/app/agent'
limit 1;

insert into finance.mcp_tools (tool_name, purpose, required_environment_variables, setup_notes) values
  ('OpenAI', 'Backend-only AI finance agent calls', array['OPENAI_API_KEY'], 'Configure as Supabase Edge Function secret.'),
  ('Oracle Fusion', 'AR aging, customer, invoice, and receipt sync', array['ORACLE_FUSION_BASE_URL', 'ORACLE_FUSION_CLIENT_ID', 'ORACLE_FUSION_CLIENT_SECRET'], 'Excel import is enabled before API sync.'),
  ('Gmail/SMTP', 'Approved customer email sending', array['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'], 'Emails remain drafts until explicit approval.'),
  ('Connected Banking', 'Statement import and reconciliation matching', array['CONNECTED_BANKING_API_URL', 'CONNECTED_BANKING_API_KEY'], 'Manual statement upload works before API integration.')
on conflict (tool_name) do nothing;
