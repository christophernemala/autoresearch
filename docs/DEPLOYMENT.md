# DHCM Finance Control Hub Deployment

## Frontend

- Runtime: Vite + React.
- Primary deployment target: Vercel.
- Build command: `npm run build`.
- Output directory: `dist`.
- Do not migrate to Next.js.

## Supabase

1. Review SQL under `supabase/migrations`.
2. Apply migrations to a reviewed Supabase project.
3. Apply `supabase/seed.sql` for DHCM seed references.
4. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` only in backend or Supabase Edge Function secrets.

## Edge Functions

Sensitive actions use Supabase Edge Functions first:

- `ai-chat`
- `ai-draft-email`
- `ai-recommend-action`
- `ai-summarize-customer`
- `ai-analyze-ar`
- `ai-analyze-import`
- `ai-analyze-reconciliation`
- `ai-generate-report-summary`
- `email-send-approved`
- `export-workbook`
- `oracle-sync`
- `banking-reconciliation`

Configure `OPENAI_API_KEY` as a Supabase secret only. Never expose it through Vite environment variables.

Email, export, Oracle, and banking functions require an approval record before execution. Production provider credentials must be configured as Supabase secrets, not Vite variables.

AI Edge Functions use backend prompt personas for AR finance analysis, collections, reconciliation, Oracle imports, Excel reporting, email drafting, and audit/compliance. These prompts live under `supabase/functions/_shared/agentPrompts.ts` so the frontend never owns the safety boundary.

## Required Checks

Run after every phase:

```powershell
npm install
npm run build
npm run typecheck
npm run lint
```

Do not claim production completion until all required routes render without missing imports, frontend secrets, console errors, broken navigation, or placeholder-only actions.
