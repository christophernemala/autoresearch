export type OrderIntakeDecision =
  | 'AUTO_APPROVED'
  | 'APPROVAL_REQUIRED'
  | 'CREDIT_HOLD'
  | 'REJECTED'
  | 'DATA_EXCEPTION';

export interface CustomerCreditProfile {
  customerId: string;
  customerName: string;
  approvedCreditLimit: number;
  openArBalance: number;
  openOrdersExposure: number;
  unbilledExposure: number;
  creditHoldStatus: boolean;
  sanctionsPassed: boolean;
  currency: string;
}

export interface SalesOrderIntakeRequest {
  orderId: string;
  customerId: string;
  currency: string;
  orderAmount: number;
  paymentTermsDays: number;
  orderDate: string;
}

export interface OrderEvaluationResult {
  orderId: string;
  decision: OrderIntakeDecision;
  totalExposureBefore: number;
  totalExposureAfter: number;
  utilizationRateAfter: number;
  reasonCode: string;
  explanation: string;
  requiresMakerChecker: boolean;
}

export function evaluateOrderIntake(
  order: SalesOrderIntakeRequest,
  profile: CustomerCreditProfile
): OrderEvaluationResult {
  // Sanctions & blocked account check
  if (!profile.sanctionsPassed) {
    return {
      orderId: order.orderId,
      decision: 'REJECTED',
      totalExposureBefore: profile.openArBalance,
      totalExposureAfter: profile.openArBalance,
      utilizationRateAfter: profile.approvedCreditLimit > 0 ? profile.openArBalance / profile.approvedCreditLimit : 1,
      reasonCode: 'SANCTIONS_OR_BLOCKED_ACCOUNT',
      explanation: 'Customer is on sanctions or blocked account list. Transaction prohibited.',
      requiresMakerChecker: false
    };
  }

  // Pre-existing credit hold
  if (profile.creditHoldStatus) {
    return {
      orderId: order.orderId,
      decision: 'CREDIT_HOLD',
      totalExposureBefore: profile.openArBalance + profile.openOrdersExposure,
      totalExposureAfter: profile.openArBalance + profile.openOrdersExposure + order.orderAmount,
      utilizationRateAfter: (profile.openArBalance + profile.openOrdersExposure + order.orderAmount) / profile.approvedCreditLimit,
      reasonCode: 'PRE_EXISTING_CREDIT_HOLD',
      explanation: 'Customer is already on credit hold due to delinquency or past-due invoices.',
      requiresMakerChecker: true
    };
  }

  const currentExposure = profile.openArBalance + profile.openOrdersExposure + profile.unbilledExposure;
  const newExposure = currentExposure + order.orderAmount;
  const utilization = profile.approvedCreditLimit > 0 ? newExposure / profile.approvedCreditLimit : 1;

  if (newExposure > profile.approvedCreditLimit) {
    return {
      orderId: order.orderId,
      decision: 'CREDIT_HOLD',
      totalExposureBefore: currentExposure,
      totalExposureAfter: newExposure,
      utilizationRateAfter: Number(utilization.toFixed(4)),
      reasonCode: 'EXCEEDS_APPROVED_CREDIT_LIMIT',
      explanation: `Order of ${order.currency} ${order.orderAmount.toLocaleString()} pushes exposure to ${order.currency} ${newExposure.toLocaleString()}, exceeding limit of ${order.currency} ${profile.approvedCreditLimit.toLocaleString()} (${(utilization * 100).toFixed(1)}% utilization).`,
      requiresMakerChecker: true
    };
  }

  if (utilization >= 0.85) {
    return {
      orderId: order.orderId,
      decision: 'APPROVAL_REQUIRED',
      totalExposureBefore: currentExposure,
      totalExposureAfter: newExposure,
      utilizationRateAfter: Number(utilization.toFixed(4)),
      reasonCode: 'HIGH_CREDIT_UTILIZATION_THRESHOLD',
      explanation: `Order pushes credit utilization to ${(utilization * 100).toFixed(1)}% (>= 85% threshold). Requires Credit Manager sign-off.`,
      requiresMakerChecker: true
    };
  }

  return {
    orderId: order.orderId,
    decision: 'AUTO_APPROVED',
    totalExposureBefore: currentExposure,
    totalExposureAfter: newExposure,
    utilizationRateAfter: Number(utilization.toFixed(4)),
    reasonCode: 'WITHIN_CREDIT_POLICY',
    explanation: `Credit check passed. Total exposure ${order.currency} ${newExposure.toLocaleString()} within limit of ${order.currency} ${profile.approvedCreditLimit.toLocaleString()} (${(utilization * 100).toFixed(1)}% utilization).`,
    requiresMakerChecker: false
  };
}
