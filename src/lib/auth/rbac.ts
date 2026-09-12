import type { Permission, UserRole } from '../../types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPER_ADMIN: [
    'receivables:read', 'receivables:export',
    'orders:read', 'orders:create', 'orders:credit_check',
    'invoices:read', 'invoices:create', 'invoices:post',
    'collections:read', 'collections:action', 'collections:dunning_send',
    'cash:read', 'cash:match', 'cash:post',
    'credit:read', 'credit:score', 'credit:override_limit',
    'ecl:read', 'ecl:calculate', 'ecl:override',
    'disputes:read', 'disputes:create', 'disputes:resolve',
    'approvals:request', 'approvals:review', 'approvals:execute',
    'audit:read', 'audit:export',
    'sco:read', 'sco:configure',
    'settings:manage', 'users:manage'
  ],
  TENANT_ADMIN: [
    'receivables:read', 'receivables:export',
    'orders:read', 'orders:create', 'orders:credit_check',
    'invoices:read', 'invoices:create', 'invoices:post',
    'collections:read', 'collections:action', 'collections:dunning_send',
    'cash:read', 'cash:match', 'cash:post',
    'credit:read', 'credit:score', 'credit:override_limit',
    'ecl:read', 'ecl:calculate', 'ecl:override',
    'disputes:read', 'disputes:create', 'disputes:resolve',
    'approvals:request', 'approvals:review',
    'audit:read', 'audit:export',
    'sco:read',
    'settings:manage', 'users:manage'
  ],
  FINANCE_CONTROLLER: [
    'receivables:read', 'receivables:export',
    'orders:read', 'orders:credit_check',
    'invoices:read', 'invoices:post',
    'collections:read', 'collections:action',
    'cash:read', 'cash:post',
    'credit:read', 'credit:score', 'credit:override_limit',
    'ecl:read', 'ecl:calculate', 'ecl:override',
    'disputes:read', 'disputes:resolve',
    'approvals:request', 'approvals:review', 'approvals:execute',
    'audit:read', 'audit:export',
    'sco:read'
  ],
  CHECKER: [
    'receivables:read',
    'invoices:read',
    'credit:read',
    'ecl:read',
    'disputes:read',
    'approvals:review', 'approvals:execute',
    'audit:read'
  ],
  MAKER: [
    'receivables:read',
    'invoices:read', 'invoices:create',
    'collections:read', 'collections:action',
    'cash:read', 'cash:match',
    'credit:read',
    'disputes:read', 'disputes:create',
    'approvals:request',
    'audit:read'
  ],
  CREDIT_MANAGER: [
    'receivables:read', 'receivables:export',
    'orders:read', 'orders:credit_check',
    'credit:read', 'credit:score', 'credit:override_limit',
    'ecl:read', 'ecl:calculate',
    'approvals:request',
    'audit:read'
  ],
  COLLECTIONS_MANAGER: [
    'receivables:read', 'receivables:export',
    'collections:read', 'collections:action', 'collections:dunning_send',
    'disputes:read', 'disputes:create',
    'approvals:request',
    'audit:read'
  ],
  COLLECTOR: [
    'receivables:read',
    'collections:read', 'collections:action',
    'disputes:read', 'disputes:create',
    'audit:read'
  ],
  CASH_APPLICATION_ANALYST: [
    'receivables:read',
    'cash:read', 'cash:match', 'cash:post',
    'approvals:request',
    'audit:read'
  ],
  BILLING_ANALYST: [
    'receivables:read',
    'invoices:read', 'invoices:create',
    'disputes:read',
    'approvals:request',
    'audit:read'
  ],
  DISPUTE_ANALYST: [
    'receivables:read',
    'disputes:read', 'disputes:create', 'disputes:resolve',
    'approvals:request',
    'audit:read'
  ],
  AUDITOR: [
    'receivables:read', 'receivables:export',
    'orders:read',
    'invoices:read',
    'collections:read',
    'cash:read',
    'credit:read',
    'ecl:read',
    'disputes:read',
    'audit:read', 'audit:export',
    'sco:read'
  ],
  READ_ONLY: [
    'receivables:read',
    'orders:read',
    'invoices:read',
    'collections:read',
    'cash:read',
    'credit:read',
    'ecl:read',
    'disputes:read',
    'audit:read'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function validateSegregationOfDuties(makerId: string, checkerId: string): { valid: boolean; reason?: string } {
  if (makerId === checkerId) {
    return {
      valid: false,
      reason: 'SECURITY_BREACH: Maker cannot act as Checker on the same transaction (Four-Eyes principle violation).'
    };
  }
  return { valid: true };
}
