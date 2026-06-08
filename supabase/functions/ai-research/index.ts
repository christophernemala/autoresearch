import { corsHeaders, json, requirePerplexityKey } from '../_shared/aiSafety.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const keyCheck = requirePerplexityKey();
  if (!keyCheck.ok) return keyCheck.response;

  const payload = await request.json().catch(() => ({}));
  const query = payload.query ?? payload.message ?? 'DHCM finance operations benchmark';
  const model = Deno.env.get('PERPLEXITY_MODEL') ?? 'sonar';

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${keyCheck.key}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a finance operations research assistant. Return concise, source-aware research notes for review. Never execute actions.'
        },
        { role: 'user', content: query }
      ]
    })
  });

  if (!response.ok) {
    return json({ error: 'Perplexity request failed', status: response.status, details: await response.text() }, 502);
  }

  const result = await response.json();
  return json({
    mode: 'research_review_required',
    model,
    query,
    response: result.choices?.[0]?.message?.content ?? 'Research response created.',
    proposedAction: {
      status: 'draft',
      requiresApproval: true
    }
  });
});
