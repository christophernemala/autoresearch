# Agentic Backend Setup

## Principle

The DHCM Finance Control Hub agent can observe, analyze, draft, and queue actions. It must not send emails, change payment status, overwrite imports, mark legal review, delete data, or trigger external systems without explicit user approval.

## Secrets

Set these only as Supabase Edge Function secrets:

```text
EMERGENT_LLM_API_KEY
EMERGENT_LLM_BASE_URL
EMERGENT_LLM_MODEL
OPENAI_API_KEY
OPENAI_BASE_URL
OPENAI_MODEL
PERPLEXITY_API_KEY
PERPLEXITY_MODEL
SUPABASE_SERVICE_ROLE_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Do not create `VITE_OPENAI_API_KEY`, `VITE_PERPLEXITY_API_KEY`, or `VITE_EMERGENT_LLM_API_KEY`. Vite exposes `VITE_` variables to the browser.

## Supabase Commands

```powershell
supabase secrets set EMERGENT_LLM_API_KEY=your_private_universal_key
supabase secrets set EMERGENT_LLM_BASE_URL=https://integrations.emergentagent.com/llm
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
supabase secrets set PERPLEXITY_API_KEY=your_perplexity_key
supabase secrets set PERPLEXITY_MODEL=sonar
supabase functions deploy ai-chat
supabase functions deploy ai-draft-email
supabase functions deploy ai-recommend-action
supabase functions deploy ai-analyze-ar
supabase functions deploy ai-analyze-import
supabase functions deploy ai-analyze-reconciliation
supabase functions deploy ai-generate-report-summary
supabase functions deploy ai-research
```

## Agent Flow

1. User asks the agent.
2. Edge Function reads approved context.
3. AI produces analysis or draft.
4. App creates `finance.agent_actions` with `draft` or `pending_approval`.
5. User approves.
6. Safe backend function executes.
7. `finance.audit_logs` records the action.

## Vercel Protection

If the deployed URL returns `401 Unauthorized`, disable protection:

```text
Vercel Dashboard -> autoresearch-dhcm -> Settings -> Deployment Protection
```

Then open:

```text
https://autoresearch-dhcm.vercel.app
```
