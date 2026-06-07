import { safeSensitiveAction } from '../_shared/sensitiveAction.ts';

Deno.serve((request) => safeSensitiveAction('banking-reconciliation', request));
