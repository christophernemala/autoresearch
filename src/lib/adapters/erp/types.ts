export type ERPProvider = 'SAP_S4HANA' | 'ORACLE_FUSION' | 'NETSUITE';

export type IntegrationStatus =
  | 'CONFIGURED'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'AUTHENTICATION_FAILED'
  | 'INTEGRATION_NOT_CONFIGURED'
  | 'ERROR';

export interface ERPConfig {
  provider: ERPProvider;
  tenantId: string;
  baseUrl?: string;
  authType: 'OAUTH2' | 'BASIC' | 'TOKEN_BASED';
  credentialsConfigured: boolean;
  status: IntegrationStatus;
  lastSyncAt?: string;
  lastErrorMessage?: string;
}

export interface ERPTestConnectionResult {
  ok: boolean;
  status: IntegrationStatus;
  latencyMs?: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ERPAdapter {
  provider: ERPProvider;
  testConnection(config: ERPConfig): Promise<ERPTestConnectionResult>;
  fetchCustomers(config: ERPConfig, limit?: number): Promise<{ success: boolean; data?: unknown[]; error?: string }>;
  fetchOpenReceivables(config: ERPConfig): Promise<{ success: boolean; data?: unknown[]; error?: string }>;
  postCashApplication(config: ERPConfig, payload: unknown): Promise<{ success: boolean; postingReference?: string; error?: string }>;
  postJournal(config: ERPConfig, payload: unknown): Promise<{ success: boolean; journalId?: string; error?: string }>;
}

export class MockProductionERPAdapter implements ERPAdapter {
  constructor(public provider: ERPProvider) {}

  async testConnection(config: ERPConfig): Promise<ERPTestConnectionResult> {
    if (!config.credentialsConfigured || !config.baseUrl) {
      return {
        ok: false,
        status: 'INTEGRATION_NOT_CONFIGURED',
        message: `${this.provider} credentials or endpoint URL are not configured. Enterprise finance invariant requires explicit credentials.`
      };
    }

    return {
      ok: true,
      status: 'CONFIGURED',
      latencyMs: 142,
      message: `Successfully authenticated to ${this.provider} gateway endpoint.`
    };
  }

  async fetchCustomers(config: ERPConfig): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
    if (!config.credentialsConfigured) {
      return { success: false, error: 'INTEGRATION_NOT_CONFIGURED' };
    }
    return { success: true, data: [] };
  }

  async fetchOpenReceivables(config: ERPConfig): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
    if (!config.credentialsConfigured) {
      return { success: false, error: 'INTEGRATION_NOT_CONFIGURED' };
    }
    return { success: true, data: [] };
  }

  async postCashApplication(config: ERPConfig): Promise<{ success: boolean; postingReference?: string; error?: string }> {
    if (!config.credentialsConfigured) {
      return { success: false, error: 'INTEGRATION_NOT_CONFIGURED' };
    }
    return { success: true, postingReference: `${this.provider}-POST-${Date.now()}` };
  }

  async postJournal(config: ERPConfig): Promise<{ success: boolean; journalId?: string; error?: string }> {
    if (!config.credentialsConfigured) {
      return { success: false, error: 'INTEGRATION_NOT_CONFIGURED' };
    }
    return { success: true, journalId: `GL-${this.provider}-${Date.now()}` };
  }
}

export const ERP_ADAPTERS: Record<ERPProvider, ERPAdapter> = {
  SAP_S4HANA: new MockProductionERPAdapter('SAP_S4HANA'),
  ORACLE_FUSION: new MockProductionERPAdapter('ORACLE_FUSION'),
  NETSUITE: new MockProductionERPAdapter('NETSUITE')
};
