import { validateSegregationOfDuties } from '../auth/rbac';

export type ControlledActionType =
  | 'CREDIT_LIMIT_OVERRIDE'
  | 'WRITE_OFF'
  | 'CREDIT_NOTE'
  | 'GL_POSTING'
  | 'CASH_APPLICATION_EXCEPTION'
  | 'INVOICE_ADJUSTMENT'
  | 'HIGH_RISK_ORDER_APPROVAL'
  | 'DISPUTE_SETTLEMENT';

export type ApprovalStatus =
  | 'PREPARED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'TAMPER_DETECTED'
  | 'FAILED';

export interface ApprovalRequest<T = Record<string, unknown>> {
  id: string;
  tenantId: string;
  actionType: ControlledActionType;
  makerUserId: string;
  makerName: string;
  checkerUserId?: string;
  checkerName?: string;
  payload: T;
  payloadHash: string; // SHA-256 of canonical payload
  status: ApprovalStatus;
  amount: number;
  currency: string;
  reason: string;
  createdAt: string;
  reviewedAt?: string;
  executedAt?: string;
  auditTrail: {
    stage: 'PREPARE' | 'REQUEST_APPROVAL' | 'REVIEW' | 'APPROVE' | 'EXECUTE' | 'VERIFY';
    actorId: string;
    timestamp: string;
    note: string;
  }[];
}

// Canonical JSON stringification ensuring key ordering consistency for hashing
export function canonicalJsonString(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonString).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((k) => JSON.stringify(k) + ':' + canonicalJsonString((obj as Record<string, unknown>)[k]));
  return '{' + pairs.join(',') + '}';
}

export async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createApprovalProposal<T extends Record<string, unknown>>(params: {
  tenantId: string;
  actionType: ControlledActionType;
  makerUserId: string;
  makerName: string;
  payload: T;
  amount: number;
  currency: string;
  reason: string;
}): Promise<ApprovalRequest<T>> {
  const canonical = canonicalJsonString(params.payload);
  const payloadHash = await computeSha256(canonical);

  const request: ApprovalRequest<T> = {
    id: `appr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId: params.tenantId,
    actionType: params.actionType,
    makerUserId: params.makerUserId,
    makerName: params.makerName,
    payload: params.payload,
    payloadHash,
    status: 'PENDING_APPROVAL',
    amount: params.amount,
    currency: params.currency,
    reason: params.reason,
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        stage: 'PREPARE',
        actorId: params.makerUserId,
        timestamp: new Date().toISOString(),
        note: `Proposal prepared with hash: ${payloadHash.slice(0, 16)}...`
      },
      {
        stage: 'REQUEST_APPROVAL',
        actorId: params.makerUserId,
        timestamp: new Date().toISOString(),
        note: `Approval requested for ${params.actionType} of ${params.currency} ${params.amount.toLocaleString()}`
      }
    ]
  };

  return request;
}

export async function reviewApproval<T extends Record<string, unknown>>(params: {
  request: ApprovalRequest<T>;
  checkerUserId: string;
  checkerName: string;
  decision: 'APPROVE' | 'REJECT';
  currentPayload: T; // Current payload to verify tamper integrity
  reviewNote?: string;
}): Promise<{ success: boolean; updatedRequest: ApprovalRequest<T>; error?: string }> {
  // Hard invariant 1: Segregation of Duties
  const sodCheck = validateSegregationOfDuties(params.request.makerUserId, params.checkerUserId);
  if (!sodCheck.valid) {
    return {
      success: false,
      updatedRequest: { ...params.request, status: 'FAILED' },
      error: sodCheck.reason
    };
  }

  // Hard invariant 2: Payload Cryptographic Integrity Check
  const currentCanonical = canonicalJsonString(params.currentPayload);
  const currentHash = await computeSha256(currentCanonical);

  if (currentHash !== params.request.payloadHash) {
    const tamperedRequest: ApprovalRequest<T> = {
      ...params.request,
      status: 'TAMPER_DETECTED',
      reviewedAt: new Date().toISOString(),
      auditTrail: [
        ...params.request.auditTrail,
        {
          stage: 'REVIEW',
          actorId: params.checkerUserId,
          timestamp: new Date().toISOString(),
          note: `TAMPER_DETECTED: Computed hash ${currentHash.slice(0, 16)} does not match original proposal hash ${params.request.payloadHash.slice(0, 16)}. Aborting execution.`
        }
      ]
    };
    return {
      success: false,
      updatedRequest: tamperedRequest,
      error: 'TAMPER_DETECTED: Cryptographic tamper detected! Payload was altered after Maker proposal creation.'
    };
  }

  const now = new Date().toISOString();
  const nextStatus: ApprovalStatus = params.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  const updatedRequest: ApprovalRequest<T> = {
    ...params.request,
    checkerUserId: params.checkerUserId,
    checkerName: params.checkerName,
    status: nextStatus,
    reviewedAt: now,
    auditTrail: [
      ...params.request.auditTrail,
      {
        stage: 'REVIEW',
        actorId: params.checkerUserId,
        timestamp: now,
        note: `Checker review: ${params.decision}. ${params.reviewNote || ''}`
      }
    ]
  };

  return { success: true, updatedRequest };
}
