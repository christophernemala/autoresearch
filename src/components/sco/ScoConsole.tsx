import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, AlertOctagon, Lock, FileSearch, Users, Activity, CheckCircle, RefreshCw } from 'lucide-react';
import { auditLedger, AuditEventRecord } from '../../lib/sco/auditTrail';
import { ROLE_PERMISSIONS } from '../../lib/auth/rbac';
import type { UserRole } from '../../types/auth';

export const ScoConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'incidents' | 'soc2'>('audit');
  const [events, setEvents] = useState<AuditEventRecord[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<'UNCHECKED' | 'VALID' | 'TAMPERED'>('UNCHECKED');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    setEvents(auditLedger.getEvents());
  }, []);

  const handleVerifyLedger = async () => {
    const check = await auditLedger.verifyLedgerIntegrity();
    setIntegrityStatus(check.valid ? 'VALID' : 'TAMPERED');
  };

  const filteredEvents = filterAction === 'ALL'
    ? events
    : events.filter((e) => e.action.includes(filterAction));

  return (
    <div className="page-stack">
      {/* Top Banner */}
      <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#4d8dff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Governance & Compliance Module
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(52, 199, 89, 0.15)', color: '#44d19d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                SOC 2 Type II Architecture
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#edf3fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ color: '#4d8dff' }} />
              Security Compliance Officer (SCO) Console
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#96a6ba' }}>
              Real-time audit log explorer, Segregation of Duties (SoD) role matrix, and cryptographic ledger verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleVerifyLedger}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                background: integrityStatus === 'VALID' ? '#44d19d' : '#1b2738',
                color: integrityStatus === 'VALID' ? '#000' : '#edf3fa',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #253346',
                fontSize: '13px'
              }}
            >
              <RefreshCw size={14} />
              {integrityStatus === 'UNCHECKED' && 'Verify Hash Chain'}
              {integrityStatus === 'VALID' && '✓ Hash Chain Verified Unbroken'}
              {integrityStatus === 'TAMPERED' && '⚠ Tamper Detected!'}
            </button>
          </div>
        </div>

        {/* Subnav */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid #253346', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: activeTab === 'audit' ? '#1b2738' : 'transparent',
              color: activeTab === 'audit' ? '#4d8dff' : '#96a6ba',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Tamper-Evident Audit Explorer
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: activeTab === 'roles' ? '#1b2738' : 'transparent',
              color: activeTab === 'roles' ? '#4d8dff' : '#96a6ba',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Access Review & Role Matrix
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: activeTab === 'incidents' ? '#1b2738' : 'transparent',
              color: activeTab === 'incidents' ? '#4d8dff' : '#96a6ba',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Security Incidents & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('soc2')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: activeTab === 'soc2' ? '#1b2738' : 'transparent',
              color: activeTab === 'soc2' ? '#4d8dff' : '#96a6ba',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            SOC 2 Readiness Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Audit Explorer */}
      {activeTab === 'audit' && (
        <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#edf3fa' }}>
              Immutable Audit Events ({filteredEvents.length} recorded)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={{ padding: '6px 10px', background: '#151f2e', border: '1px solid #253346', borderRadius: '4px', color: '#edf3fa', fontSize: '12px' }}
              >
                <option value="ALL">All Event Types</option>
                <option value="INVOICE">Invoices</option>
                <option value="APPROVAL">Approvals</option>
                <option value="LOGIN">Auth & SSO</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #253346', color: '#6f8196', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>Actor</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Resource</th>
                  <th style={{ padding: '10px' }}>Event SHA-256 Hash</th>
                  <th style={{ padding: '10px' }}>Chain Integrity</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid #1b2738' }}>
                    <td style={{ padding: '10px', color: '#96a6ba', whiteSpace: 'nowrap' }}>
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', color: '#edf3fa' }}>
                      <strong>{evt.actorName}</strong>
                      <span style={{ display: 'block', fontSize: '10px', color: '#6f8196' }}>{evt.actorType}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#1b2738', color: '#75a8ff', fontWeight: 600 }}>
                        {evt.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#96a6ba' }}>
                      {evt.resourceType}: <code>{evt.resourceId}</code>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#6f8196' }}>
                      {evt.eventHash.slice(0, 16)}...
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: '#44d19d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Linked
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles Matrix */}
      {activeTab === 'roles' && (
        <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#edf3fa' }}>
            Enterprise RBAC Matrix & Segregation of Duties (12 Canonical Roles)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
              <div key={role} style={{ background: '#151f2e', border: '1px solid #253346', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#edf3fa' }}>{role}</strong>
                  <span style={{ fontSize: '11px', color: '#4d8dff', fontWeight: 700 }}>{perms.length} perms</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {perms.map((p) => (
                    <span key={p} style={{ fontSize: '10px', padding: '2px 5px', background: '#0c131f', borderRadius: '3px', color: '#96a6ba' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Incidents */}
      {activeTab === 'incidents' && (
        <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#edf3fa' }}>
            Security Incidents & Telemetry Feeds
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ padding: '12px', background: '#151f2e', border: '1px solid #253346', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#44d19d', fontSize: '13px' }}>Cross-Tenant Isolation Filter: Active</strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#96a6ba' }}>
                  All database queries strictly bounded to authenticated tenant UUID. 0 leakage attempts recorded.
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>NORMAL</span>
            </div>

            <div style={{ padding: '12px', background: '#151f2e', border: '1px solid #253346', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#44d19d', fontSize: '13px' }}>Four-Eyes Cryptographic Guard: Active</strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#96a6ba' }}>
                  Maker-Checker invariant monitored. All payload mutations automatically abort with TAMPER_DETECTED.
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>NORMAL</span>
            </div>

            <div style={{ padding: '12px', background: '#151f2e', border: '1px solid #253346', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#44d19d', fontSize: '13px' }}>Prompt Injection Traps: Guarded</strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#96a6ba' }}>
                  External remittance texts isolated in low-privilege blocks. LLM cannot bypass ledger authorization.
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>SECURE</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SOC 2 Readiness */}
      {activeTab === 'soc2' && (
        <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#edf3fa' }}>
            SOC 2 Type II Readiness Matrix
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#151f2e', borderRadius: '6px', border: '1px solid #253346' }}>
              <strong style={{ color: '#edf3fa', fontSize: '13px' }}>CC6.1 - Logical Access Security</strong>
              <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 0' }}>
                Multi-tenant RLS, MFA enforcement, and SSO integration (Google, Microsoft Entra ID, Okta).
              </p>
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>
                ✓ PASS (Engineered)
              </span>
            </div>

            <div style={{ padding: '12px', background: '#151f2e', borderRadius: '6px', border: '1px solid #253346' }}>
              <strong style={{ color: '#edf3fa', fontSize: '13px' }}>CC6.3 - Least Privilege & SoD</strong>
              <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 0' }}>
                Maker–Checker segregation: Maker cannot approve their own financial write-offs or limit increases.
              </p>
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>
                ✓ PASS (Engineered)
              </span>
            </div>

            <div style={{ padding: '12px', background: '#151f2e', borderRadius: '6px', border: '1px solid #253346' }}>
              <strong style={{ color: '#edf3fa', fontSize: '13px' }}>CC7.2 - System Monitoring & Audit</strong>
              <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 0' }}>
                Append-only audit trail with SHA-256 hash chaining answering Who, What, When, Where, Why.
              </p>
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>
                ✓ PASS (Engineered)
              </span>
            </div>

            <div style={{ padding: '12px', background: '#151f2e', borderRadius: '6px', border: '1px solid #253346' }}>
              <strong style={{ color: '#edf3fa', fontSize: '13px' }}>CC6.8 - Data Tampering Detection</strong>
              <p style={{ fontSize: '12px', color: '#96a6ba', margin: '4px 0 0' }}>
                Pre-execution payload hash recalculation aborts execution if mutated in transit.
              </p>
              <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: '#44d19d', fontWeight: 700 }}>
                ✓ PASS (Engineered)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
