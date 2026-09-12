# IFRS 9 Expected Credit Loss (ECL) Provisioning Engine

## 1. Regulatory Context
Under IFRS 9 Financial Instruments (Simplified Approach for Trade Receivables), entities must establish a provision matrix estimating lifetime Expected Credit Losses (ECL). 

The O2C Orchestration platform implements a deterministic calculation engine separating operational credit scoring from regulatory provisioning.

---

## 2. Calculation Model
$$\text{ECL} = \text{EAD} \times \text{PD} \times \text{LGD} \times \text{Macroeconomic Overlay}$$

### Parameters:
- **EAD (Exposure at Default)**: The gross carrying amount of trade receivables within each aging bucket.
- **PD (Probability of Default)**: Historical default frequency for customers within that aging bucket.
- **LGD (Loss Given Default)**: Unrecovered loss rate given default (typically 50% to 100%).
- **Macroeconomic Overlay**: Forward-looking adjustment multiplier reflecting GDP trends, interest rates, and industry sector stress:
  - **Baseline Scenario**: 1.00x multiplier (Weight: 60%)
  - **Downturn Scenario**: 1.25x multiplier (Weight: 30%)
  - **Upturn Scenario**: 0.85x multiplier (Weight: 10%)

---

## 3. Standard Provision Matrix

| Aging Bucket | Historical PD | Standard LGD | Baseline Rate | Downturn Rate | Loss Logic |
|---|:---:|:---:|:---:|:---:|---|
| **Current** | 1.0% | 50% | 0.50% | 0.63% | Normal performing exposure |
| **1–30 Days** | 3.0% | 55% | 1.65% | 2.06% | Low delinquency |
| **31–60 Days** | 8.0% | 60% | 4.80% | 6.00% | Escalated follow-up |
| **61–90 Days** | 18.0% | 65% | 11.70% | 14.63% | High delinquency |
| **91–180 Days** | 40.0% | 70% | 28.00% | 35.00% | Severe delinquency |
| **181–360 Days** | 75.0% | 80% | 60.00% | 75.00% | Impaired exposure |
| **361+ Days** | 100.0% | 100% | **100.00%** | **100.00%** | Mandatory 100% full provision |
