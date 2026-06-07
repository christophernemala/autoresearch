import { safeAgentResponse } from '../_shared/aiSafety.ts';

Deno.serve((request) => safeAgentResponse('ai-analyze-ar', request));
