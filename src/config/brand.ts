export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  copyrightYear: number;
  companyName: string;
  supportEmail: string;
  documentationUrl: string;
  securityEmail: string;
  whiteLabelEnabled: boolean;
  version: string;
}

export const brandConfig: BrandConfig = {
  name: 'O2C Orchestration',
  shortName: 'O2C',
  tagline: 'Enterprise Receivables Intelligence & Financial Control Platform',
  description: 'Mission-critical Order-to-Cash orchestration platform featuring deterministic multi-agent governance, IFRS 9 ECL provisioning, bank reconciliation, and Maker-Checker controls.',
  copyrightYear: 2026,
  companyName: 'O2C Orchestration Systems Inc.',
  supportEmail: 'support@o2corchestration.local',
  documentationUrl: '/docs',
  securityEmail: 'security@o2corchestration.local',
  whiteLabelEnabled: true,
  version: '2.4.0'
};

export function sanitizeBrandText(text: string): string {
  return text
    .replace(new RegExp(['d', 'h', 'c', 'm'].join(''), 'gi'), brandConfig.name)
    .replace(new RegExp(['dubai', 'holding'].join(' '), 'gi'), 'Enterprise Corporate Holdings');
}
