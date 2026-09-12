import { computeSha256 } from '../governance/makerChecker';

export interface AuditEventRecord {
  id: string;
  tenantId: string;
  actorType: 'USER' | 'AGENT' | 'SYSTEM' | 'EXTERNAL_API';
  actorId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  requestId: string;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
  beforeHash?: string;
  afterHash?: string;
  approvalRequestId?: string;
  metadata?: Record<string, unknown>;
  previousEventHash: string;
  eventHash: string;
}

export class ImmutableAuditLedger {
  private events: AuditEventRecord[] = [];
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash

  async recordEvent(params: Omit<AuditEventRecord, 'id' | 'timestamp' | 'previousEventHash' | 'eventHash'>): Promise<AuditEventRecord> {
    const timestamp = new Date().toISOString();
    const id = `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const previousEventHash = this.lastHash;

    const eventPayloadString = `${previousEventHash}:${timestamp}:${params.actorId}:${params.action}:${params.resourceType}:${params.resourceId}:${params.correlationId}`;
    const eventHash = await computeSha256(eventPayloadString);

    const record: AuditEventRecord = {
      ...params,
      id,
      timestamp,
      previousEventHash,
      eventHash
    };

    this.events.unshift(record);
    this.lastHash = eventHash;
    return record;
  }

  getEvents(tenantId?: string): AuditEventRecord[] {
    if (!tenantId) return [...this.events];
    return this.events.filter((e) => e.tenantId === tenantId);
  }

  async verifyLedgerIntegrity(): Promise<{ valid: boolean; brokenAtIndex?: number; expectedHash?: string; foundHash?: string }> {
    if (this.events.length === 0) return { valid: true };

    // Traverse from oldest to newest to verify SHA-256 chain
    const chronological = [...this.events].reverse();
    let expectedPrevious = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < chronological.length; i++) {
      const event = chronological[i];
      if (event.previousEventHash !== expectedPrevious) {
        return {
          valid: false,
          brokenAtIndex: i,
          expectedHash: expectedPrevious,
          foundHash: event.previousEventHash
        };
      }

      const calculatedString = `${event.previousEventHash}:${event.timestamp}:${event.actorId}:${event.action}:${event.resourceType}:${event.resourceId}:${event.correlationId}`;
      const calculatedHash = await computeSha256(calculatedString);

      if (calculatedHash !== event.eventHash) {
        return {
          valid: false,
          brokenAtIndex: i,
          expectedHash: calculatedHash,
          foundHash: event.eventHash
        };
      }

      expectedPrevious = event.eventHash;
    }

    return { valid: true };
  }
}

export const auditLedger = new ImmutableAuditLedger();
