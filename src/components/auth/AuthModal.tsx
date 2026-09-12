import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, KeyRound, Building2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { DEMO_PROFILES, DEMO_TENANTS, createSessionForRole, simulateSsoLogin } from '../../lib/auth/authStore';
import type { AuthSession, SsoProviderId, UserRole } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (session: AuthSession) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sso' | 'credentials' | 'personas'>('personas');
  const [email, setEmail] = useState('controller@acme-corp.com');
  const [password, setPassword] = useState('EnterprisePassword2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState('tenant-acme-global');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (!requiresMfa) {
      setRequiresMfa(true);
      return;
    }

    if (mfaCode.length < 6) {
      setErrorMessage('Please enter the 6-digit TOTP verification code from your authenticator.');
      return;
    }

    // Authenticate as Controller with MFA verification
    const session = createSessionForRole('FINANCE_CONTROLLER', selectedTenant, true);
    onSuccess(session);
  };

  const handleSsoClick = (provider: SsoProviderId) => {
    setErrorMessage(null);
    const session = simulateSsoLogin(provider, email);
    onSuccess(session);
  };

  const handlePersonaSelect = (role: UserRole) => {
    setErrorMessage(null);
    const session = createSessionForRole(role, selectedTenant, true);
    onSuccess(session);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-card" style={{
        background: '#111a26',
        border: '1px solid #253346',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #253346',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1a3760, #4d8dff)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '16px', color: '#edf3fa' }}>
                Enterprise Authentication
              </strong>
              <span style={{ fontSize: '12px', color: '#96a6ba' }}>
                Multi-Tenant SSO & RBAC Control
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', color: '#96a6ba', fontSize: '18px', padding: '4px 8px' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderBottom: '1px solid #253346',
          background: '#0c131f'
        }}>
          <button
            onClick={() => { setActiveTab('personas'); setRequiresMfa(false); }}
            style={{
              padding: '12px',
              background: activeTab === 'personas' ? '#111a26' : 'transparent',
              color: activeTab === 'personas' ? '#4d8dff' : '#96a6ba',
              borderBottom: activeTab === 'personas' ? '2px solid #4d8dff' : 'none',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Role Personas
          </button>
          <button
            onClick={() => { setActiveTab('sso'); setRequiresMfa(false); }}
            style={{
              padding: '12px',
              background: activeTab === 'sso' ? '#111a26' : 'transparent',
              color: activeTab === 'sso' ? '#4d8dff' : '#96a6ba',
              borderBottom: activeTab === 'sso' ? '2px solid #4d8dff' : 'none',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Enterprise SSO
          </button>
          <button
            onClick={() => { setActiveTab('credentials'); setRequiresMfa(false); }}
            style={{
              padding: '12px',
              background: activeTab === 'credentials' ? '#111a26' : 'transparent',
              color: activeTab === 'credentials' ? '#4d8dff' : '#96a6ba',
              borderBottom: activeTab === 'credentials' ? '2px solid #4d8dff' : 'none',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Credentials + MFA
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 111, 122, 0.15)',
              border: '1px solid #ef6f7a',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef6f7a',
              fontSize: '13px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tenant Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#96a6ba', marginBottom: '6px' }}>
              Select Active Tenant Organization
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#151f2e',
                  border: '1px solid #253346',
                  borderRadius: '6px',
                  color: '#edf3fa',
                  fontSize: '13px'
                }}
              >
                {DEMO_TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.currency}) — {t.domain}
                  </option>
                ))}
              </select>
              <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#96a6ba' }} />
            </div>
          </div>

          {/* Tab 1: Instant Personas */}
          {activeTab === 'personas' && (
            <div>
              <p style={{ fontSize: '12px', color: '#96a6ba', marginTop: 0, marginBottom: '14px' }}>
                Select an authorized financial role to test Segregation of Duties (Maker vs. Checker), subledger posting, or auditor view:
              </p>
              <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {DEMO_PROFILES.map((p) => (
                  <button
                    key={p.role}
                    onClick={() => handlePersonaSelect(p.role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#151f2e',
                      border: '1px solid #253346',
                      borderRadius: '8px',
                      color: '#edf3fa',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{p.name}</strong>
                      <span style={{ fontSize: '11px', color: '#96a6ba' }}>{p.title} ({p.email})</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: p.role === 'CHECKER' ? 'rgba(52, 199, 89, 0.15)' : p.role === 'MAKER' ? 'rgba(255, 149, 0, 0.15)' : 'rgba(77, 141, 255, 0.15)',
                      color: p.role === 'CHECKER' ? '#44d19d' : p.role === 'MAKER' ? '#e6b450' : '#75a8ff',
                      fontWeight: 700
                    }}>
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Enterprise SSO */}
          {activeTab === 'sso' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#96a6ba', margin: 0 }}>
                Federated authentication using OpenID Connect (OIDC) & SAML 2.0 with PKCE verification:
              </p>
              <button
                onClick={() => handleSsoClick('entra')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#151f2e',
                  border: '1px solid #253346',
                  borderRadius: '8px',
                  color: '#edf3fa',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <div style={{ width: '20px', height: '20px', background: '#0078D4', borderRadius: '4px' }} />
                <span>Continue with Microsoft Entra ID</span>
              </button>

              <button
                onClick={() => handleSsoClick('google')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#151f2e',
                  border: '1px solid #253346',
                  borderRadius: '8px',
                  color: '#edf3fa',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <div style={{ width: '20px', height: '20px', background: '#EA4335', borderRadius: '4px' }} />
                <span>Continue with Google Workspace</span>
              </button>

              <button
                onClick={() => handleSsoClick('okta')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#151f2e',
                  border: '1px solid #253346',
                  borderRadius: '8px',
                  color: '#edf3fa',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <div style={{ width: '20px', height: '20px', background: '#00297A', borderRadius: '4px' }} />
                <span>Continue with Okta / Auth0</span>
              </button>
            </div>
          )}

          {/* Tab 3: Credentials + MFA */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit}>
              {!requiresMfa ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#96a6ba', marginBottom: '4px' }}>
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#151f2e',
                        border: '1px solid #253346',
                        borderRadius: '6px',
                        color: '#edf3fa',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#96a6ba', marginBottom: '4px' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 36px 10px 12px',
                          background: '#151f2e',
                          border: '1px solid #253346',
                          borderRadius: '6px',
                          color: '#edf3fa',
                          fontSize: '13px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '10px',
                          background: 'transparent',
                          color: '#96a6ba'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#4d8dff',
                      color: '#000',
                      fontWeight: 700,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    Proceed to MFA Verification
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: '#151f2e',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <KeyRound size={28} style={{ color: '#4d8dff', marginBottom: '8px' }} />
                    <strong style={{ display: 'block', color: '#edf3fa', fontSize: '14px' }}>
                      Two-Factor Authentication Required
                    </strong>
                    <span style={{ fontSize: '12px', color: '#96a6ba' }}>
                      Enter the 6-digit code from your authenticator app
                    </span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#151f2e',
                        border: '1px solid #253346',
                        borderRadius: '6px',
                        color: '#edf3fa',
                        fontSize: '20px',
                        textAlign: 'center',
                        letterSpacing: '6px',
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#44d19d',
                      color: '#000',
                      fontWeight: 700,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    Verify & Authenticate
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
