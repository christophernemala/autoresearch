# AR O2C Finance Control Platform Blueprint

This replaces the previous DHCM-specific concept with a generic Microsoft-style Accounts Receivable and Order-to-Cash control platform.

## Core modules

1. Aging Analysis
- Normal aging buckets only: Current, 1-30, 31-60, 61-90, 91-180, 181-360, 361+.
- No 120-day bucket in normal aging.
- Required headers: transaction description, transaction number, transaction date, GL date, applied amount, payment data, customer name, business unit, customer number, original amount, outstanding amount, due date, days late, status, collector comment.

2. IFRS 9 ECL Provision Dashboard
- Separate dashboard from normal aging.
- ECL buckets: Current, 1-30, 31-60, 61-90, 91-120, 121-180, 181-360, 361+.
- 120-day bucket applies only to ECL provision logic.
- 180 days and above receives 100 percent provision.
- Provision amount = outstanding amount multiplied by provision rate.
- Provision rate is rule-based and can later be replaced by a statistical model.

3. IFRS 7 and BU DSO Reporting
- Reports credit risk exposure by business unit.
- Shows gross AR, outstanding AR, applied amount, over-90 exposure, weighted average days late, DSO proxy, and liquidity risk.
- BU DSO proxy = outstanding amount divided by gross billed amount multiplied by 365.
- CEO control index combines collectible base quality, collection progress, dispute hygiene, and bank allocation discipline.

4. Oracle Fusion-like AR Operations
- Manual invoice close.
- Partial payment allocation.
- Dispute flagging.
- Promise-to-pay status.
- Collector comments.
- End-of-day customer handling report.
- Audit trail for every close, allocation, and comment.

5. Bank Statement Verification
- Daily morning bank statement import.
- Match bank reference number to invoice number, customer name, customer number, and amount.
- Output Excel report with bank reference number, invoice number, customer name, customer number, amount, match status, confidence, and exception reason.
- Matching logic: exact invoice reference, amount match, payer name similarity, date proximity, duplicate detection.

6. SOA Excel and Email Workflow
- Generate customer-wise statement of account.
- Pull customer email from SLA/contract data where available.
- Draft humanized collection email.
- Attach SOA Excel.
- Require human approval before sending.
- Log draft status and follow-up comment.

7. Document Expiry Controls
- Security cheque expiry reminders.
- Trade license expiry reminders.
- Customer document resubmission report.
- Separate Excel export for expiry monitoring.

8. Microsoft-style Interface
- Visual language should feel familiar to finance users: Power BI, Excel, Dynamics, and Microsoft Copilot style.
- Dark professional interface with blue, teal, and neutral surfaces.
- No organization-specific branding.
- Copilot model positioning: Microsoft Copilot is the trusted finance-facing assistant layer, while backend logic remains model-agnostic.

## Production data rule

Do not scrape customer or invoice data from the public internet. Production data must come from approved sources only: Oracle Fusion export, bank statement files, SLA/contract repository, Microsoft Graph/Outlook, Google Drive files explicitly connected by the user, Supabase, or approved MCP connectors.

For testing, use anonymized seed data only and label it clearly as test data.
