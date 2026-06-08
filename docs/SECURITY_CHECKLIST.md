# Security Checklist

## Frontend

- No OpenAI, Perplexity, SMTP, Oracle, banking, or Supabase service-role secrets in frontend code.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are allowed in the browser.
- Passwords are not stored in localStorage.
- All destructive actions are approval-gated.

## Backend

- Supabase Edge Functions require JWT verification when deployed.
- Store secrets with Supabase secrets, not source files.
- Log every approved action in `finance.audit_logs`.
- Use `finance.agent_action_approvals` before email, reconciliation, import overwrite, legal status, or payment updates.

## Deployment

- Vercel deployment protection must be intentionally configured.
- If public demo access is required, production protection should be disabled.
- GitHub repository connection may need manual linking in Vercel dashboard.

## AI Safety

- AI output is draft content.
- AI must not execute external actions directly.
- AI recommendations must include source context and approval status.
