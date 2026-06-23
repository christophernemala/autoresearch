export const ORACLE_AR_REQUIRED_COLUMNS = [
  'Customer Number',
  'Customer Name',
  'Customer Vertical',
  'Bill To Location',
  'Site Use Name',
  'Receivable Code Combination',
  'Company Name',
  'Receivable Account',
  'Intercompany',
  'Project',
  'Profit Center',
  'Sub Account',
  'Contract Number',
  'Reference',
  'Transaction Source',
  'Transaction Type',
  'Transaction Number',
  'Transaction Description',
  'GL Date',
  'Transaction Date',
  'Due Date',
  'Days Late',
  'Original Invoice Amount',
  'Applied Amount',
  'Amount Due Remaining',
  'Advertiser',
  'PO Number',
  'Sales Rep',
  'Current',
  '1-30 Days',
  '31-60 Days',
  '61-90 Days',
  '91-180 Days',
  '181-360 Days',
  '361+ Days'
] as const;

export type OracleArRequiredColumn = typeof ORACLE_AR_REQUIRED_COLUMNS[number];

export const ORACLE_AGING_BUCKET_COLUMNS = [
  'Current',
  '1-30 Days',
  '31-60 Days',
  '61-90 Days',
  '91-180 Days',
  '181-360 Days',
  '361+ Days'
] as const;

export const ENTITY_CODE_MAP: Record<string, string> = {
  'Finance Management Group': 'FMG',
  'Residential Community Management': 'RCM',
  'Urban Community Management': 'UCM',
  'Property Community Management': 'PCM',
  'Property District Management': 'PDM'
};

export function validateOracleArColumns(uploadedColumns: string[]) {
  const normalizedUploaded = new Set(uploadedColumns.map(normalizeColumn));
  return ORACLE_AR_REQUIRED_COLUMNS.filter((column) => !normalizedUploaded.has(normalizeColumn(column)));
}

export function normalizeColumn(column: string) {
  return column.trim().toLowerCase().replace(/\s+/g, ' ');
}
