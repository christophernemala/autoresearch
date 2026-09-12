import type { AgingBucket } from '../../types';

export interface EclBucketRate {
  bucket: AgingBucket;
  basePdRate: number; // Probability of Default (0.0 to 1.0)
  lgdRate: number;    // Loss Given Default (typically 0.4 to 0.7)
  overlayMultiplier: number; // Forward-looking macroeconomic factor (e.g. 1.10)
  effectiveEclRate: number;  // (PD * LGD * overlay)
}

export interface EclBucketResult {
  bucket: AgingBucket;
  exposureAtDefault: number; // EAD
  effectiveRate: number;
  provisionAmount: number;
}

export interface EclCalculationResult {
  modelId: string;
  modelVersion: string;
  calculatedAt: string;
  totalEad: number;
  totalProvision: number;
  overallCoverageRatio: number;
  macroeconomicScenario: 'BASELINE' | 'DOWNTURN' | 'UPTURN';
  scenarioWeight: number;
  bucketResults: EclBucketResult[];
}

export const DEFAULT_ECL_MATRIX: Record<AgingBucket, { pd: number; lgd: number }> = {
  'Current': { pd: 0.01, lgd: 0.50 },
  '1-30': { pd: 0.03, lgd: 0.55 },
  '31-60': { pd: 0.08, lgd: 0.60 },
  '61-90': { pd: 0.18, lgd: 0.65 },
  '91-180': { pd: 0.40, lgd: 0.70 },
  '181-360': { pd: 0.75, lgd: 0.80 },
  '361+': { pd: 1.00, lgd: 1.00 } // 100% loss expectation for > 1 year exposures
};

export const MACRO_SCENARIOS = {
  BASELINE: 1.00,
  DOWNTURN: 1.25,
  UPTURN: 0.85
};

export function calculateIfrs9Ecl(
  exposures: Record<AgingBucket, number>,
  scenario: keyof typeof MACRO_SCENARIOS = 'BASELINE',
  customMatrix = DEFAULT_ECL_MATRIX
): EclCalculationResult {
  const overlayMultiplier = MACRO_SCENARIOS[scenario];
  const bucketResults: EclBucketResult[] = [];

  let totalEad = 0;
  let totalProvision = 0;

  const buckets: AgingBucket[] = ['Current', '1-30', '31-60', '61-90', '91-180', '181-360', '361+'];

  for (const bucket of buckets) {
    const ead = Number((exposures[bucket] || 0).toFixed(2));
    const config = customMatrix[bucket];
    // ECL rate = min(1.0, PD * LGD * overlay)
    const effectiveRate = Math.min(1.0, Number((config.pd * config.lgd * overlayMultiplier).toFixed(4)));
    const provisionAmount = Number((ead * effectiveRate).toFixed(2));

    totalEad += ead;
    totalProvision += provisionAmount;

    bucketResults.push({
      bucket,
      exposureAtDefault: ead,
      effectiveRate,
      provisionAmount
    });
  }

  totalEad = Number(totalEad.toFixed(2));
  totalProvision = Number(totalProvision.toFixed(2));
  const overallCoverageRatio = totalEad > 0 ? Number((totalProvision / totalEad).toFixed(4)) : 0;

  return {
    modelId: 'IFRS9-SIMPLIFIED-V2',
    modelVersion: '2026.3',
    calculatedAt: new Date().toISOString(),
    totalEad,
    totalProvision,
    overallCoverageRatio,
    macroeconomicScenario: scenario,
    scenarioWeight: scenario === 'BASELINE' ? 0.6 : scenario === 'DOWNTURN' ? 0.3 : 0.1,
    bucketResults
  };
}
