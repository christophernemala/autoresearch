import type { AuthSession, SsoProviderId, Tenant, User, UserRole } from '../../types/auth';

export const DEMO_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme-global',
    name: 'Acme Global Manufacturing Corp',
    slug: 'acme-global',
    domain: 'acme-corp.com',
    currency: 'USD',
    ssoEnabled: true,
    ssoProvider: 'ENTRA_ID',
    ssoDomain: 'acme-corp.com',
    enforceMfa: true,
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: 'tenant-apex-holdings',
    name: 'Apex Enterprise Holdings Ltd',
    slug: 'apex-holdings',
    domain: 'apex-holdings.local',
    currency: 'AED',
    ssoEnabled: true,
    ssoProvider: 'GOOGLE',
    ssoDomain: 'apex-holdings.local',
    enforceMfa: true,
    createdAt: '2025-03-20T10:30:00Z'
  }
];

export const DEMO_PROFILES: { role: UserRole; name: string; email: string; title: string }[] = [
  { role: 'FINANCE_CONTROLLER', name: 'Eleanor Vance', email: 'controller@acme-corp.com', title: 'Corporate Controller' },
  { role: 'CREDIT_MANAGER', name: 'Marcus Sterling', email: 'credit.mgr@acme-corp.com', title: 'VP Credit & Risk' },
  { role: 'CHECKER', name: 'Victoria Zhao', email: 'checker@acme-corp.com', title: 'Senior Treasury Signer (Checker)' },
  { role: 'MAKER', name: 'Daniel Park', email: 'maker@acme-corp.com', title: 'AR Operations Specialist (Maker)' },
  { role: 'COLLECTIONS_MANAGER', name: 'Sarah Jenkins', email: 'collections@acme-corp.com', title: 'Collections Director' },
  { role: 'CASH_APPLICATION_ANALYST', name: 'Arun Patel', email: 'cash.app@acme-corp.com', title: 'Cash Application Lead' },
  { role: 'AUDITOR', name: 'Henrik Lindqvist', email: 'auditor@compliance.firm', title: 'Independent SOC 2 Auditor' },
  { role: 'SUPER_ADMIN', name: 'System Administrator', email: 'admin@o2corchestration.local', title: 'Platform Security Officer' }
];

const STORAGE_KEY = 'o2c_auth_session';

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createSessionForRole(
  role: UserRole,
  tenantId = 'tenant-acme-global',
  mfaVerified = true
): AuthSession {
  const profile = DEMO_PROFILES.find((p) => p.role === role) ?? DEMO_PROFILES[0];
  const tenant = DEMO_TENANTS.find((t) => t.id === tenantId) ?? DEMO_TENANTS[0];

  const now = Date.now();
  const expiresAt = now + 8 * 60 * 60 * 1000; // 8-hour enterprise session

  const user: User = {
    id: `usr-${role.toLowerCase()}-${Date.now().toString(36)}`,
    tenantId: tenant.id,
    email: profile.email,
    name: profile.name,
    role,
    mfaEnabled: tenant.enforceMfa,
    mfaVerified,
    lastLoginAt: new Date().toISOString(),
    sessionExpiresAt: new Date(expiresAt).toISOString()
  };

  const session: AuthSession = {
    user,
    tenant,
    accessToken: `jwt_live_${Math.random().toString(36).slice(2)}_${Date.now()}`,
    refreshToken: `rt_${Math.random().toString(36).slice(2)}`,
    expiresAt
  };

  saveSession(session);
  return session;
}

export function simulateSsoLogin(provider: SsoProviderId, email?: string): AuthSession {
  const selectedEmail = email || 'controller@acme-corp.com';
  const tenant = DEMO_TENANTS[0];

  const user: User = {
    id: `usr-sso-${Date.now().toString(36)}`,
    tenantId: tenant.id,
    email: selectedEmail,
    name: selectedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    role: 'FINANCE_CONTROLLER',
    mfaEnabled: true,
    mfaVerified: true,
    lastLoginAt: new Date().toISOString(),
    sessionExpiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  };

  const session: AuthSession = {
    user,
    tenant,
    accessToken: `jwt_sso_${provider}_${Date.now()}`,
    refreshToken: `rt_sso_${Date.now()}`,
    expiresAt: Date.now() + 8 * 3600 * 1000
  };

  saveSession(session);
  return session;
}

export function verifyTenantIsolation(currentUser: User, requestedTenantId: string): boolean {
  if (currentUser.role === 'SUPER_ADMIN') return true;
  return currentUser.tenantId === requestedTenantId;
}
