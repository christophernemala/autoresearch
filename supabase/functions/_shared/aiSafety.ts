import { promptForFunction } from './agentPrompts.ts';

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

export function requirePerplexityKey() {
  const key = Deno.env.get('PERPLEXITY_API_KEY');
  if (!key) {
    return { ok: false as const, response: json({ error: 'PERPLEXITY_API_KEY is not configured for this Supabase Edge Function.' }, 503) };
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
  const prompt = promptForFunction(functionName);
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${keyCheck.key}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: `${prompt.systemPrompt}\n\nSafety boundary: draft only. Never execute irreversible actions. Always require explicit user approval and audit logging before execution.`
        },
        {
          role: 'user',
          content: JSON.stringify({ userQuestion, pageContext, requestedFunction: functionName })
        }
      ]
    })
  });

  if (!openAiResponse.ok) {
    return json({ error: 'OpenAI request failed', status: openAiResponse.status, details: await openAiResponse.text() }, 502);
  }

  const aiPayload = await openAiResponse.json();
  const outputText = aiPayload.output_text
    ?? aiPayload.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? []).map((item: { text?: string }) => item.text).filter(Boolean).join('\n')
    ?? 'Draft response created. Review required before execution.';

  return json({
    functionName,
    persona: prompt.persona,
    mode: 'approval_required',
    userQuestion,
    pageContext,
    model,
    response: outputText,
    proposedAction: {
      status: 'draft',
      requiresApproval: true,
      irreversibleActionsBlocked: ['send_email', 'delete_data', 'mark_legal_review', 'overwrite_import', 'change_payment_status', 'external_system_action']
    }
  });
}
