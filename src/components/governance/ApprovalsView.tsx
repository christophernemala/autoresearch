import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, FileCode, Lock, UserCheck, RefreshCw } from 'lucide-react';
import type { ApprovalRequest } from '../../lib/governance/makerChecker';
import { createApprovalProposal, reviewApproval } from '../../lib/governance/makerChecker';
import type { User } from '../../types/auth';

interface ApprovalsViewProps {
  currentUser: User;
}

const INITIAL_PROPOSALS: ApprovalRequest[] = [
  {
    id: 'appr-credit-001',
    tenantId: 'tenant-acme-global',
    actionType: 'CREDIT_LIMIT_OVERRIDE',
    makerUserId: 'usr-maker-daniel',
    makerName: 'Daniel Park (Maker)',
    payload: { customerId: 'CUST-8819', newCreditLimit: 450000, previousLimit: 250000, riskRating: 'Watch' },
    payloadHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    status: 'PENDING_APPROVAL',
    amount: 200000,
    currency: 'USD',
    reason: 'Strategic account expansion with collateral backing.',
    createdAt: '2026-09-11T14:30:00Z',
    auditTrail: [
      { stage: 'PREPARE', actorId: 'usr-maker-daniel', timestamp: '2026-09-11T14:28:00Z', note: 'Prepared credit expansion model' },
      { stage: 'REQUEST_APPROVAL', actorId: 'usr-maker-daniel', timestamp: '2026-09-11T14:30:00Z', note: 'Requested Checker review' }
    ]
  },
  {
    id: 'appr-writeoff-002',
    tenantId: 'tenant-acme-global',
    actionType: 'WRITE_OFF',
    makerUserId: 'usr-maker-daniel',
    makerName: 'Daniel Park (Maker)',
    payload: { invoiceId: 'INV-2024-9128', writeOffAmount: 4850, glAccount: '6100-BAD-DEBT' },
    payloadHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'PENDING_APPROVAL',
    amount: 4850,
    currency: 'USD',
    reason: 'Customer in liquidation; approved by legal counsel.',
    createdAt: '2026-09-12T08:15:00Z',
    auditTrail: [
      { stage: 'PREPARE', actorId: 'usr-maker-daniel', timestamp: '2026-09-12T08:10:00Z', note: 'Legal proof attached' },
      { stage: 'REQUEST_APPROVAL', actorId: 'usr-maker-daniel', timestamp: '2026-09-12T08:15:00Z', note: 'Ready for controller signoff' }
    ]
  }
];

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ currentUser }) => {
  const [proposals, setProposals] = useState<ApprovalRequest[]>(INITIAL_PROPOSALS);
  const [selectedProposal, setSelectedProposal] = useState<ApprovalRequest>(INITIAL_PROPOSALS[0]);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleApprove = async (simulateTamper = false) => {
    setAlertMessage(null);

    // If simulating tamper, mutate payload
    const payloadToValidate = simulateTamper
      ? { ...selectedProposal.payload, newCreditLimit: 99999999, writeOffAmount: 99999 }
      : selectedProposal.payload;

    const result = await reviewApproval({
      request: selectedProposal,
      checkerUserId: currentUser.id,
      checkerName: currentUser.name,
      decision: 'APPROVE',
      currentPayload: payloadToValidate,
      reviewNote: simulateTamper ? 'Attempting execution with mutated payload' : 'Verified against credit policy'
    });

    if (!result.success) {
      setAlertMessage({ type: 'error', text: result.error || 'Approval failed' });
    } else {
      setAlertMessage({ type: 'success', text: `Proposal ${selectedProposal.id} successfully APPROVED by ${currentUser.name}.` });
    }

    setProposals((prev) => prev.map((p) => (p.id === result.updatedRequest.id ? result.updatedRequest : p)));
    setSelectedProposal(result.updatedRequest);
  };

  const handleReject = async () => {
    setAlertMessage(null);
    const result = await reviewApproval({
      request: selectedProposal,
      checkerUserId: currentUser.id,
      checkerName: currentUser.name,
      decision: 'REJECT',
      currentPayload: selectedProposal.payload,
      reviewNote: 'Rejected by Checker: insufficient documentation.'
    });

    if (!result.success) {
      setAlertMessage({ type: 'error', text: result.error || 'Rejection failed' });
    } else {
      setAlertMessage({ type: 'warning', text: `Proposal ${selectedProposal.id} REJECTED.` });
    }

    setProposals((prev) => prev.map((p) => (p.id === result.updatedRequest.id ? result.updatedRequest : p)));
    setSelectedProposal(result.updatedRequest);
  };

  return (
    <div className="page-stack">
      <div className="panel" style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#edf3fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ color: '#4d8dff' }} />
              Maker–Checker Four-Eyes Governance Center
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#96a6ba' }}>
              Financial posting invariant: <code>makerUserId !== checkerUserId</code> with SHA-256 payload cryptographic hash attestation.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#96a6ba' }}>Current Signer:</span>
            <span style={{ fontSize: '12px', padding: '4px 10px', background: '#1b2738', borderRadius: '6px', color: '#75a8ff', fontWeight: 600 }}>
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
        </div>

        {alertMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            background: alertMessage.type === 'error' ? 'rgba(239,111,122,0.15)' : alertMessage.type === 'success' ? 'rgba(68,209,157,0.15)' : 'rgba(230,180,80,0.15)',
            border: `1px solid ${alertMessage.type === 'error' ? '#ef6f7a' : alertMessage.type === 'success' ? '#44d19d' : '#e6b450'}`,
            color: alertMessage.type === 'error' ? '#ef6f7a' : alertMessage.type === 'success' ? '#44d19d' : '#e6b450',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {alertMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <strong>{alertMessage.text}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          {/* List of Proposals */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6f8196', textTransform: 'uppercase' }}>
              Pending Controlled Actions
            </span>
            {proposals.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProposal(p)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: selectedProposal.id === p.id ? '#1b2738' : '#151f2e',
                  border: `1px solid ${selectedProposal.id === p.id ? '#4d8dff' : '#253346'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#edf3fa' }}>{p.actionType}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: p.status === 'APPROVED' ? 'rgba(68,209,157,0.2)' : p.status === 'TAMPER_DETECTED' ? 'rgba(239,111,122,0.3)' : 'rgba(230,180,80,0.2)',
                    color: p.status === 'APPROVED' ? '#44d19d' : p.status === 'TAMPER_DETECTED' ? '#ef6f7a' : '#e6b450',
                    fontWeight: 700
                  }}>
                    {p.status}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#4d8dff' }}>
                  {p.currency} {p.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#96a6ba', marginTop: '4px' }}>
                  Maker: {p.makerName}
                </div>
              </div>
            ))}
          </div>

          {/* Proposal Detail & Actions */}
          <div style={{ background: '#151f2e', border: '1px solid #253346', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #253346', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6f8196', textTransform: 'uppercase', fontWeight: 700 }}>Proposal Details</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '16px', color: '#edf3fa' }}>
                  {selectedProposal.actionType} — {selectedProposal.id}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#6f8196', display: 'block' }}>Material Exposure</span>
                <strong style={{ fontSize: '18px', color: '#edf3fa' }}>
                  {selectedProposal.currency} {selectedProposal.amount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#0c131f', padding: '10px', borderRadius: '4px', border: '1px solid #253346' }}>
                <span style={{ fontSize: '11px', color: '#96a6ba', display: 'block' }}>Maker (Prepared By)</span>
                <strong style={{ fontSize: '13px', color: '#edf3fa' }}>{selectedProposal.makerName}</strong>
                <span style={{ fontSize: '11px', color: '#6f8196', display: 'block', marginTop: '2px' }}>
                  ID: {selectedProposal.makerUserId}
                </span>
              </div>
              <div style={{ background: '#0c131f', padding: '10px', borderRadius: '4px', border: '1px solid #253346' }}>
                <span style={{ fontSize: '11px', color: '#96a6ba', display: 'block' }}>Checker (Authorized Signer)</span>
                <strong style={{ fontSize: '13px', color: selectedProposal.checkerName ? '#44d19d' : '#e6b450' }}>
                  {selectedProposal.checkerName || 'Pending Review'}
                </strong>
                <span style={{ fontSize: '11px', color: '#6f8196', display: 'block', marginTop: '2px' }}>
                  {selectedProposal.reviewedAt ? new Date(selectedProposal.reviewedAt).toLocaleString() : 'Awaiting action'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#96a6ba', display: 'block', marginBottom: '4px' }}>
                Immutable Payload SHA-256 Hash
              </span>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                padding: '8px 12px',
                background: '#0c131f',
                border: '1px solid #253346',
                borderRadius: '4px',
                color: '#75a8ff',
                wordBreak: 'break-all'
              }}>
                {selectedProposal.payloadHash}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#96a6ba', display: 'block', marginBottom: '4px' }}>
                Payload Content (JSON)
              </span>
              <pre style={{
                margin: 0,
                padding: '10px',
                background: '#0c131f',
                border: '1px solid #253346',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#edf3fa',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {JSON.stringify(selectedProposal.payload, null, 2)}
              </pre>
            </div>

            {/* Checker Action Buttons */}
            {selectedProposal.status === 'PENDING_APPROVAL' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #253346', paddingTop: '16px' }}>
                <button
                  onClick={() => handleApprove(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#44d19d',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  Approve as Independent Checker
                </button>

                <button
                  onClick={() => handleApprove(true)}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(239, 111, 122, 0.2)',
                    color: '#ef6f7a',
                    border: '1px solid #ef6f7a',
                    fontWeight: 600,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                  title="Simulate modifying payload in transit to test tamper detection"
                >
                  <AlertTriangle size={14} />
                  Simulate Payload Tampering (Test Security)
                </button>

                <button
                  onClick={handleReject}
                  style={{
                    padding: '10px 16px',
                    background: '#1b2738',
                    color: '#ef6f7a',
                    border: '1px solid #253346',
                    fontWeight: 600,
                    borderRadius: '6px'
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
