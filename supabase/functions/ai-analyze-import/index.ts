import { safeAgentResponse } from '../_shared/aiSafety.ts';

Deno.serve((request) => safeAgentResponse('ai-analyze-import', request));
