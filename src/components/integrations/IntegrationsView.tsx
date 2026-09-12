import React, { useState } from 'react';
import { Database, Landmark, Mail, CheckCircle2, AlertCircle, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { ERP_ADAPTERS, ERPConfig, ERPProvider } from '../../lib/adapters/erp/types';

export const IntegrationsView: React.FC = () => {
  const [erpConfigs, setErpConfigs] = useState<Record<ERPProvider, ERPConfig>>({
    SAP_S4HANA: {
      provider: 'SAP_S4HANA',
      tenantId: 'tenant-acme-global',
      baseUrl: '',
      authType: 'OAUTH2',
      credentialsConfigured: false,
      status: 'INTEGRATION_NOT_CONFIGURED'
    },
    ORACLE_FUSION: {
      provider: 'ORACLE_FUSION',
      tenantId: 'tenant-acme-global',
      baseUrl: 'https://fusion-financials.oraclecloud.com',
      authType: 'TOKEN_BASED',
      credentialsConfigured: true,
      status: 'CONFIGURED',
      lastSyncAt: '2026-09-12T05:30:00Z'
    },
    NETSUITE: {
      provider: 'NETSUITE',
      tenantId: 'tenant-acme-global',
      baseUrl: '',
      authType: 'TOKEN_BASED',
      credentialsConfigured: false,
      status: 'INTEGRATION_NOT_CONFIGURED'
    }
  });

  const [testingStatus, setTestingStatus] = useState<Record<string, { testing: boolean; message?: string; ok?: boolean }>>({});

  const handleTestConnection = async (provider: ERPProvider) => {
    setTestingStatus((prev) => ({ ...prev, [provider]: { testing: true } }));
    const adapter = ERP_ADAPTERS[provider];
    const config = erpConfigs[provider];

    const result = await adapter.testConnection(config);
    setTestingStatus((prev) => ({
      ...prev,
      [provider]: {
        testing: false,
        message: result.message,
        ok: result.ok
      }
    }));
  };

  return (
    <div className="page-stack">
      <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#edf3fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database style={{ color: '#4d8dff' }} />
              Enterprise Integration Adapters & Connectors
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#96a6ba' }}>
              Standardized adapter interfaces for ERPs, banks, and notification providers. No fabricated connection success.
            </p>
          </div>
        </div>

        {/* Section 1: ERP Adapters */}
        <h3 style={{ fontSize: '14px', color: '#edf3fa', margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={16} style={{ color: '#4d8dff' }} />
          Tier-1 ERP System Connectors
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {(['ORACLE_FUSION', 'SAP_S4HANA', 'NETSUITE'] as ERPProvider[]).map((p) => {
            const config = erpConfigs[p];
            const test = testingStatus[p];

            return (
              <div key={p} style={{ background: '#151f2e', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#edf3fa', display: 'block' }}>
                      {p === 'ORACLE_FUSION' ? 'Oracle Fusion ERP' : p === 'SAP_S4HANA' ? 'SAP S/4HANA Cloud' : 'NetSuite SuiteTalk'}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#96a6ba' }}>{config.authType} REST Adapter</span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: config.status === 'CONFIGURED' ? 'rgba(52,199,89,0.15)' : 'rgba(230,180,80,0.15)',
                    color: config.status === 'CONFIGURED' ? '#44d19d' : '#e6b450'
                  }}>
                    {config.status}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#96a6ba', marginBottom: '12px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    Endpoint: <code style={{ color: '#edf3fa' }}>{config.baseUrl || 'None (Set environment secret)'}</code>
                  </div>
                  <div>
                    Last Sync: {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : 'Never'}
                  </div>
                </div>

                {test && test.message && (
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    fontSize: '11px',
                    background: test.ok ? 'rgba(52,199,89,0.1)' : 'rgba(239,111,122,0.1)',
                    border: `1px solid ${test.ok ? '#44d19d' : '#ef6f7a'}`,
                    color: test.ok ? '#44d19d' : '#ef6f7a'
                  }}>
                    {test.message}
                  </div>
                )}

                <button
                  onClick={() => handleTestConnection(p)}
                  disabled={test?.testing}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#1b2738',
                    color: '#edf3fa',
                    border: '1px solid #253346',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={12} className={test?.testing ? 'spinning' : ''} />
                  {test?.testing ? 'Testing Endpoint...' : 'Test Connection'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Section 2: Bank Statement Ingestion */}
        <h3 style={{ fontSize: '14px', color: '#edf3fa', margin: '28px 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Landmark size={16} style={{ color: '#44d19d' }} />
          Banking & Cash Ingestion Adapters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ background: '#151f2e', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
            <strong style={{ fontSize: '14px', color: '#edf3fa', display: 'block' }}>
              SWIFT MT940 / CAMT.053 Parser
            </strong>
            <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 12px' }}>
              Deterministic structured ISO 20022 parsing with balance reconciliation check: <code>Opening + Credits - Debits = Closing</code>.
            </p>
            <span style={{ fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>✓ READY FOR INGESTION</span>
          </div>

          <div style={{ background: '#151f2e', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
            <strong style={{ fontSize: '14px', color: '#edf3fa', display: 'block' }}>
              Multi-Format XLSX / CSV Upload Engine
            </strong>
            <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 12px' }}>
              Column alias matching with SHA-256 file checksum de-duplication to prevent double-posting bank receipts.
            </p>
            <span style={{ fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>✓ READY FOR INGESTION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
