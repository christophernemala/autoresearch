import { safeSensitiveAction } from '../_shared/sensitiveAction.ts';

Deno.serve((request) => safeSensitiveAction('export-workbook', request));
