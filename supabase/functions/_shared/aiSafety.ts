export type AgentFunctionName =
  | 'ai-chat'
  | 'ai-draft-email'
  | 'ai-recommend-action'
  | 'ai-summarize-customer'
  | 'ai-analyze-ar'
  | 'ai-analyze-import'
  | 'ai-analyze-reconciliation'
  | 'ai-generate-report-summary';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function requireOpenAiKey() {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) {
    return { ok: false as const, response: json({ error: 'OPENAI_API_KEY is not configured for this Supabase Edge Function.' }, 503) };
  }
  return { ok: true as const, key };
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' }
  });
}

export async function safeAgentResponse(functionName: AgentFunctionName, request: Request) {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const keyCheck = requireOpenAiKey();
  if (!keyCheck.ok) return keyCheck.response;

  const payload = await request.json().catch(() => ({}));
  const pageContext = payload.pageContext ?? {};
  const userQuestion = payload.message ?? payload.prompt ?? '';

  return json({
    functionName,
    mode: 'approval_required',
    userQuestion,
    pageContext,
    response: 'AI execution is backend-only. This function is wired as the secure boundary for OpenAI calls and returns draft output that must be approved before execution.',
    proposedAction: {
      status: 'draft',
      requiresApproval: true,
      irreversibleActionsBlocked: ['send_email', 'delete_data', 'mark_legal_review', 'overwrite_import', 'change_payment_status', 'external_system_action']
    }
  });
}
