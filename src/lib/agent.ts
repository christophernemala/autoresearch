import type { AgentContext } from '../types';

export const floatingAgentRoutes = [
  '/app/dashboard',
  '/ar',
  '/app/customers',
  '/app/imports',
  '/app/reconciliation',
  '/app/banking',
  '/app/exports',
  '/app/reports'
];

export function shouldShowAgentWidget(pathname: string) {
  return floatingAgentRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function createRouteContext(pathname: string, search: string): AgentContext {
  const params = new URLSearchParams(search);
  if (pathname.startsWith('/app/customers/')) {
    const segments = pathname.split('/').filter(Boolean);
    const selectedCustomerId = segments[segments.length - 1];
    return { route: pathname, title: 'Customer workspace', selectedCustomerId };
  }
  if (pathname === '/ar') {
    return {
      route: pathname,
      title: 'AR dashboard',
      period: params.get('period') || 'Q2 2025',
      selectedEntity: params.get('entity') || 'All',
      displayMode: params.get('mode') || 'Amount'
    };
  }
  if (pathname === '/app/reconciliation') {
    return { route: pathname, title: 'Reconciliation', selectedTransactions: ['bank-001', 'bank-002'] };
  }
  if (pathname === '/app/imports') {
    return { route: pathname, title: 'Oracle Fusion import', importValidationId: 'import-oracle-may' };
  }
  return { route: pathname, title: routeTitle(pathname) };
}

function routeTitle(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || 'dashboard';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
}
