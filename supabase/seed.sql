insert into finance.entities (code, name) values
  ('DCM', 'Dubai Community Management'),
  ('DPCM', 'Dubai Properties Community Management'),
  ('DPDM', 'Dubai Properties Development Management'),
  ('NCM', 'Nakheel Community Management'),
  ('NPCM', 'Nakheel Palm Community Management')
on conflict (code) do nothing;

insert into finance.mcp_tools (tool_name, purpose, required_environment_variables, setup_notes) values
  ('OpenAI', 'Backend-only AI finance agent calls', array['OPENAI_API_KEY'], 'Configure as Supabase Edge Function secret.'),
  ('Oracle Fusion', 'AR aging, customer, invoice, and receipt sync', array['ORACLE_FUSION_BASE_URL', 'ORACLE_FUSION_CLIENT_ID', 'ORACLE_FUSION_CLIENT_SECRET'], 'Excel import is enabled before API sync.'),
  ('Gmail/SMTP', 'Approved customer email sending', array['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'], 'Emails remain drafts until explicit approval.'),
  ('Connected Banking', 'Statement import and reconciliation matching', array['CONNECTED_BANKING_CLIENT_ID', 'CONNECTED_BANKING_CLIENT_SECRET'], 'Manual statement upload works before API integration.')
on conflict (tool_name) do nothing;
