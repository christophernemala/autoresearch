import type {
  AgingBucket,
  AllocationReceipt,
  CollectionAccount,
  ControlItem,
  DisputeCase,
  EntityAging,
  Receivable,
  ReportDefinition,
  RiskLevel,
  SlaStatus,
  TreasuryPosition
} from '../types';

export const agingBuckets: AgingBucket[] = ['Current', '1-30', '31-60', '61-90', '91-180', '181-360', '361+'];

export function formatAed(value: number, compact = false) {
  if (compact && Math.abs(value) >= 1_000_000_000) return `AED ${(value / 1_000_000_000).toFixed(2)}B`;
  if (compact && Math.abs(value) >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2
  }).format(value);
}

export function formatDate(value: string) {
  if (!value || value === 'Pending') return value;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function getRiskFromScore(score: number): RiskLevel {
  if (score >= 82) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

export function getSlaStatus(ageDays: number): SlaStatus {
  if (ageDays > 45) return 'Breached';
  if (ageDays > 21) return 'Due Soon';
  return 'On Track';
}

export function sumBy<T>(rows: T[], selector: (row: T) => number) {
  return rows.reduce((total, row) => total + selector(row), 0);
}

export function aggregateBy<T>(rows: T[], key: (row: T) => string, value: (row: T) => number) {
  return Array.from(
    rows.reduce((map, row) => {
      const itemKey = key(row);
      map.set(itemKey, (map.get(itemKey) ?? 0) + value(row));
      return map;
    }, new Map<string, number>())
  ).map(([label, amount]) => ({ label, amount }));
}

export function agingDistribution(receivables: Receivable[]) {
  return agingBuckets.map((bucket) => ({
    bucket,
    amount: sumBy(
      receivables.filter((record) => record.bucket === bucket),
      (record) => record.amountDue
    )
  }));
}

export function calculateExecutiveMetrics(
  entities: EntityAging[],
  receivables: Receivable[],
  allocations: AllocationReceipt[],
  disputes: DisputeCase[],
  controls: ControlItem[]
) {
  const totalAr = sumBy(entities, (entity) => entity.totalAr);
  const overdueAr = sumBy(entities, (entity) => entity.overdue);
  const ninetyPlus = sumBy(
    receivables.filter((record) => ['91-180', '181-360', '361+'].includes(record.bucket)),
    (record) => record.amountDue
  );
  const unappliedCash = sumBy(
    allocations.filter((receipt) => receipt.status !== 'Allocated'),
    (receipt) => receipt.amount
  );
  const disputedAmount = sumBy(disputes, (dispute) => dispute.amountBlocked);
  const highRiskCustomers = new Set(receivables.filter((record) => record.risk === 'High' || record.risk === 'Critical').map((record) => record.customerId)).size;
  const readinessScore = Math.round((controls.filter((control) => control.status === 'Reviewed' || control.status === 'Signed Off').length / controls.length) * 100);

  return {
    totalAr,
    overdueAr,
    ninetyPlus,
    weightedDso: sumBy(entities, (entity) => entity.dso * entity.totalAr) / totalAr,
    weightedCei: sumBy(entities, (entity) => entity.cei * entity.totalAr) / totalAr,
    collectionEfficiency: 87.4,
    unappliedCash,
    disputedAmount,
    highRiskCustomers,
    readinessScore
  };
}

export function buildReports(
  definitions: ReportDefinition[],
  receivables: Receivable[],
  entities: EntityAging[],
  collections: CollectionAccount[],
  allocations: AllocationReceipt[],
  disputes: DisputeCase[],
  controls: ControlItem[]
): ReportDefinition[] {
  return definitions.map((report) => {
    if (report.id === 'aging-summary') {
      return { ...report, rows: agingDistribution(receivables).map((row) => ({ bucket: row.bucket, amount: row.amount })) };
    }
    if (report.id === 'entity-summary') {
      return { ...report, rows: entities.map((entity) => ({ entity: entity.entity, totalAr: entity.totalAr, overdue: entity.overdue, dso: entity.dso, cei: entity.cei })) };
    }
    if (report.id === 'category-summary') {
      return { ...report, rows: aggregateBy(receivables, (record) => record.category, (record) => record.amountDue).map((row) => ({ category: row.label, amount: row.amount })) };
    }
    if (report.id === 'ninety-matrix') {
      return {
        ...report,
        rows: aggregateBy(
          receivables.filter((record) => ['91-180', '181-360', '361+'].includes(record.bucket)),
          (record) => `${record.entity} / ${record.risk}`,
          (record) => record.amountDue
        ).map((row) => ({ segment: row.label, amount: row.amount }))
      };
    }
    if (report.id === 'collector-performance') {
      return { ...report, rows: collections.map((row) => ({ owner: row.owner, customer: row.customerName, exposure: row.exposure, overdue90: row.overdue90, status: row.followUpStatus })) };
    }
    if (report.id === 'dispute-aging') {
      return { ...report, rows: disputes.map((row) => ({ dispute: row.id, customer: row.customerName, ageDays: row.ageDays, sla: row.slaStatus, amountBlocked: row.amountBlocked })) };
    }
    if (report.id === 'cash-allocation') {
      return { ...report, rows: allocations.map((row) => ({ receipt: row.id, customer: row.suggestedCustomer, invoice: row.suggestedInvoice, confidence: row.confidence, amount: row.amount, status: row.status })) };
    }
    if (report.id === 'control-pack') {
      return { ...report, rows: controls.map((row) => ({ area: row.area, control: row.control, owner: row.owner, status: row.status, evidence: row.evidenceStatus, exceptions: row.exceptions })) };
    }
    return report;
  });
}

export function toCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
}

export function downloadCsv(fileName: string, rows: Record<string, string | number>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function chartPercent(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(4, Math.round((value / max) * 100));
}

export function getMax<T>(rows: T[], selector: (row: T) => number) {
  return Math.max(1, ...rows.map(selector));
}

export function treasuryTotals(positions: TreasuryPosition[]) {
  return {
    expected: sumBy(positions, (row) => row.expectedCollections),
    confirmed: sumBy(positions, (row) => row.confirmedReceipts),
    unallocated: sumBy(positions, (row) => row.unallocatedReceipts),
    pending: sumBy(positions, (row) => row.bankConfirmationPending),
    forecast7: sumBy(positions, (row) => row.forecast7Days),
    forecast30: sumBy(positions, (row) => row.forecast30Days)
  };
}
