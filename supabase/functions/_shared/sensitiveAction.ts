export type SensitiveActionName =
  | 'email-send-approved'
  | 'export-workbook'
  | 'oracle-sync'
  | 'banking-reconciliation';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' }
  });
}

export async function safeSensitiveAction(actionName: SensitiveActionName, request: Request) {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const payload = await request.json().catch(() => ({}));
  if (!payload.approvalId) {
    return json({
      actionName,
      status: 'pending_approval',
      error: 'approvalId is required before this sensitive backend action can execute.'
    }, 409);
  }

  return json({
    actionName,
    status: 'queued',
    approvalId: payload.approvalId,
    message: 'Sensitive action accepted behind the Supabase Edge Function boundary. Production implementation must verify approval, write audit_logs, and then execute the provider-specific action.'
  });
}
