export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'FINANCE_CONTROLLER'
  | 'CREDIT_MANAGER'
  | 'COLLECTIONS_MANAGER'
  | 'COLLECTOR'
  | 'CASH_APPLICATION_ANALYST'
  | 'BILLING_ANALYST'
  | 'DISPUTE_ANALYST'
  | 'MAKER'
  | 'CHECKER'
  | 'AUDITOR'
  | 'READ_ONLY';

export type Permission =
  | 'receivables:read'
  | 'receivables:export'
  | 'orders:read'
  | 'orders:create'
  | 'orders:credit_check'
  | 'invoices:read'
  | 'invoices:create'
  | 'invoices:post'
  | 'collections:read'
  | 'collections:action'
  | 'collections:dunning_send'
  | 'cash:read'
  | 'cash:match'
  | 'cash:post'
  | 'credit:read'
  | 'credit:score'
  | 'credit:override_limit'
  | 'ecl:read'
  | 'ecl:calculate'
  | 'ecl:override'
  | 'disputes:read'
  | 'disputes:create'
  | 'disputes:resolve'
  | 'approvals:request'
  | 'approvals:review'
  | 'approvals:execute'
  | 'audit:read'
  | 'audit:export'
  | 'sco:read'
  | 'sco:configure'
  | 'settings:manage'
  | 'users:manage';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  ssoEnabled: boolean;
  ssoProvider?: 'GOOGLE' | 'ENTRA_ID' | 'OKTA' | 'AUTH0';
  ssoDomain?: string;
  enforceMfa: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  mfaEnabled: boolean;
  mfaVerified: boolean;
  lastLoginAt: string;
  sessionExpiresAt: string;
}

export interface AuthSession {
  user: User;
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export type SsoProviderId = 'google' | 'entra' | 'okta' | 'auth0';

export interface SsoProviderConfig {
  id: SsoProviderId;
  name: string;
  protocol: 'OIDC' | 'SAML2';
  icon: string;
  clientIdPlaceholder: string;
  discoveryEndpoint: string;
  enabled: boolean;
}
