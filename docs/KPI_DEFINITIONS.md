# KPI Definitions & Financial Formulas: O2C Command Center

This document outlines the mathematical formulas and business definitions for all executive and operational metrics computed within the O2C Command Center. No metric is generated randomly.

---

## 1. Core Receivables Metrics

### Total Accounts Receivable (Total AR)
$$\text{Total AR} = \sum_{i=1}^{N} \text{Invoice Amount Due Remaining}_i$$
- **Definition**: The total outstanding gross balance of all unpaid and partially paid customer invoices across all entities.

### Overdue Accounts Receivable (Overdue AR)
$$\text{Overdue AR} = \sum_{i \in \text{Overdue}} \text{Invoice Amount Due Remaining}_i \quad \text{where } \text{DueDate}_i < \text{AsOfDate}$$
- **Definition**: The portion of Total AR where the invoice due date has passed without full payment.

### 90+ Days Overdue Exposure
$$\text{90+ Overdue} = \sum \text{Amount}_{\text{91-180}} + \sum \text{Amount}_{\text{181-360}} + \sum \text{Amount}_{\text{361+}}$$
- **Definition**: Severely delinquent receivables requiring intensified collection action or default provisioning.

---

## 2. Efficiency & Velocity Indicators

### Days Sales Outstanding (DSO)
$$\text{DSO} = \left( \frac{\text{Total Accounts Receivable}}{\text{Total Credit Sales in Period}} \right) \times \text{Days in Period}$$
- **Definition**: The average number of days it takes for credit sales to be converted into cash.

### Collection Effectiveness Index (CEI)
$$\text{CEI} = \left( \frac{\text{Beginning Receivables} + \text{Credit Sales} - \text{Ending Total Receivables}}{\text{Beginning Receivables} + \text{Credit Sales} - \text{Ending Current Receivables}} \right) \times 100$$
- **Definition**: Measures collection performance over a given period against the total available amount that could have been collected. A CEI close to 100% indicates superior collection efficiency.

---

## 3. Cash Allocation & Credit Risk Metrics

### Unapplied Cash Ratio
$$\text{Unapplied Cash} = \sum_{j=1}^{M} \text{Bank Receipt Balance}_j \quad \text{where matched} = \text{false}$$
- **Definition**: Bank funds received and acknowledged in cash ledger accounts that have not yet been cleared against open subledger invoices.

### IFRS 9 Expected Credit Loss (ECL)
$$\text{ECL} = \sum_{\text{bucket } b} \left( \text{EAD}_b \times \text{PD}_b \times \text{LGD}_b \times \text{Macro Overlay} \right)$$
- **$\text{EAD}_b$**: Exposure at Default (gross receivables in bucket $b$).
- **$\text{PD}_b$**: Probability of Default for bucket $b$.
- **$\text{LGD}_b$**: Loss Given Default (unrecovered fraction).
- **Macro Overlay**: Forward-looking macroeconomic adjustment factor (Baseline 1.0x, Downturn 1.25x, Upturn 0.85x).
- **Rule**: Receivables in the 361+ days aging bucket carry an effective loss rate of $100\%$.
