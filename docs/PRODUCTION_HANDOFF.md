# DHCM Finance Control Hub Production Handoff

## Current State

- Frontend: Vite + React on Vercel.
- Database/Auth target: Supabase.
- Sensitive backend actions: Supabase Edge Functions.
- AI providers: OpenAI for finance agent work, Perplexity for research assistant work.
- Public URL: `https://autoresearch-dhcm.vercel.app`

## Important

If the public URL shows `401 Unauthorized`, the issue is Vercel Deployment Protection, not the React build. Disable protection in:

```text
Vercel Dashboard -> autoresearch-dhcm -> Settings -> Deployment Protection
```

## Safe Agentic Design

The agent is intentionally approval-gated:

```text
observe -> analyze -> draft -> user approval -> backend execution -> audit log
```

The agent must not directly send email, update legal status, overwrite import data, change payment status, or call external systems without approval.

## Backend Secrets

Set keys as Supabase Edge Function secrets:

```text
OPENAI_API_KEY
OPENAI_BASE_URL
OPENAI_MODEL
EMERGENT_LLM_API_KEY
EMERGENT_LLM_BASE_URL
EMERGENT_LLM_MODEL
PERPLEXITY_API_KEY
PERPLEXITY_MODEL
SUPABASE_SERVICE_ROLE_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Do not use `VITE_OPENAI_API_KEY`, `VITE_PERPLEXITY_API_KEY`, or `VITE_EMERGENT_LLM_API_KEY`.

## Checks

```powershell
npm install
npm run typecheck
npm run lint
npm run build
```
