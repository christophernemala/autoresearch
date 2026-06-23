# Feature Specification: DHCM Finance Control Hub

**Feature Branch**: `dhcm-finance-control-hub`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "DHCM Finance Control Hub - a production-grade finance operations and O2C control platform for receivables, collections, reconciliations, disputes, allocations, treasury visibility, audit readiness, and executive reporting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Executive Finance Overview (Priority: P1)

As a finance leader, I need one landing dashboard that shows AR exposure, overdue risk, 90+ concentration, DSO, CEI, unapplied cash, disputes, and month-end readiness so I can decide where the team should focus today.

**Why this priority**: This is the primary daily entry point and establishes whether the product is useful to executives and finance managers.

**Independent Test**: Can be tested by opening the application dashboard and confirming that every required KPI, trend indicator, risk badge, aging chart, entity exposure view, priority panel, and exception list is visible with AED formatting and clear source assumptions.

**Acceptance Scenarios**:

1. **Given** realistic finance operations data, **When** a user opens the dashboard, **Then** the user sees total AR, overdue AR, 90+ overdue, DSO, CEI, collection efficiency, unapplied cash, disputed amount, high-risk customers, and month-end readiness.
2. **Given** no records match a filter or source data is unavailable, **When** the dashboard renders, **Then** it shows a clear empty or source-limited state instead of broken charts or placeholder content.

---

### User Story 2 - Receivables Aging Operations (Priority: P1)

As an AR analyst, I need a serious receivables aging table with filters, sorting, aging buckets, risk labels, and row drilldown so I can locate priority invoices and understand collection context.

**Why this priority**: Receivables aging is the core finance workflow and feeds collections, disputes, treasury forecasts, and reports.

**Independent Test**: Can be tested by filtering by entity, category, aging bucket, and risk; sorting by amount, days late, customer, and due date; searching invoice/customer text; and opening a drilldown drawer.

**Acceptance Scenarios**:

1. **Given** invoices across all required aging buckets, **When** a user filters to 91+ exposure, **Then** the results include 91-180, 181-360, and 361+ records and display a correct 90+ total.
2. **Given** a user selects an invoice row, **When** the detail drawer opens, **Then** customer, entity, transaction, dates, amounts, category, owner, risk, and status are visible.

---

### User Story 3 - Collections Workspace (Priority: P2)

As a collections manager, I need a priority queue with follow-up status, promise-to-pay, escalation, owner assignment, and draft-only communication support so that daily collection actions are organized without pretending external messages were sent.

**Why this priority**: Collections converts aging insight into daily operational action.

**Independent Test**: Can be tested by viewing high-value, 90+ overdue, and escalation queues; opening an account; adding UI-level notes; marking follow-up; setting promise-to-pay; escalating; and seeing draft-only labels.

**Acceptance Scenarios**:

1. **Given** overdue accounts with different owners and statuses, **When** the collections page opens, **Then** daily priority, 90+ overdue, high-value, and escalation states are visible.
2. **Given** no email integration exists, **When** the user asks for a customer follow-up, **Then** the product labels the output as draft-only and does not claim delivery.

---

### User Story 4 - Allocation, Disputes, Treasury, Controls, Reports (Priority: P2)

As a finance operations team, we need dedicated workspaces for cash allocation, disputes, treasury visibility, audit controls, and reports so that exceptions are tracked through operational states rather than hidden in a generic dashboard.

**Why this priority**: These modules turn the product from a dashboard into a control platform.

**Independent Test**: Can be tested by navigating to each module and confirming that each page includes meaningful records, statuses, owners, dates, amounts, empty states, and report/export behavior where applicable.

**Acceptance Scenarios**:

1. **Given** unapplied receipts, **When** a user opens cash allocation, **Then** suggested matches show confidence based on reference, customer, amount, and manual review criteria.
2. **Given** disputes and controls, **When** a user opens dispute or audit pages, **Then** owner, age, SLA/evidence status, linked invoice, timeline/checklist, and blocked amount are visible.
3. **Given** a user opens reports, **When** they select a report view, **Then** the product shows report-style summaries and supports a clean CSV export where export is available.

---

### User Story 5 - Enterprise UI And Responsive Experience (Priority: P3)

As any finance user, I need the product to feel mature, calm, accessible, and responsive across desktop, laptop, and tablet screens so that repeated operational use is comfortable.

**Why this priority**: The product must avoid generic generated UI and support professional daily use.

**Independent Test**: Can be tested by reviewing navigation, tables, badges, charts, drawers, focus states, loading states, empty states, and responsive layouts at desktop, laptop, and tablet widths.

**Acceptance Scenarios**:

1. **Given** a finance user navigates between modules, **When** pages transition, **Then** motion is subtle, useful, and never distracting.
2. **Given** a keyboard user moves through controls, **When** focus changes, **Then** interactive elements have visible focus states and semantic labels.

### Edge Cases

- No receivable, collection, dispute, allocation, treasury, control, or report records match the active filters.
- Source data is limited to local realistic seed data because backend finance tables are not connected.
- A chart has too few records to render honestly; the page should show a KPI/table or source-limited state.
- An action implies external side effects such as email, ledger allocation, or bank confirmation; the UI must label it draft-only or review-only unless a real integration exists.
- Financial numbers are large enough to require compact and full AED formatting without misalignment.
- Long customer, entity, transaction, and description values must not break table layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an executive dashboard with total AR, overdue AR, 90+ overdue, DSO, CEI, collection efficiency, unapplied cash, disputed amount, high-risk customers, and month-end readiness.
- **FR-002**: System MUST provide receivables aging buckets for Current, 1-30, 31-60, 61-90, 91-180, 181-360, and 361+.
- **FR-003**: System MUST calculate 90+ Days as 91-180 plus 181-360 plus 361+.
- **FR-004**: Users MUST be able to search, filter, sort, and drill into receivables by entity, category, aging bucket, risk, amount, days late, customer, and due date.
- **FR-005**: System MUST show customer, customer number, entity, transaction number, description, invoice date, due date, days late, original amount, applied amount, remaining amount, category, owner, status, and risk for receivable records.
- **FR-006**: System MUST provide a collections workspace with daily priority, 90+ overdue, high-value accounts, follow-up state, promise-to-pay, escalation, last contact, next action, owner, and notes.
- **FR-007**: System MUST label customer communication generation as "Draft only" unless real email or messaging integration exists.
- **FR-008**: System MUST provide cash allocation views for unapplied receipts, unidentified payments, suggested invoice matches, proof of payment reference, bank reference, confidence, and allocation status.
- **FR-009**: System MUST define match confidence through business rules such as exact customer plus amount, same customer plus close amount, reference match, partial payment possibility, and manual review required.
- **FR-010**: System MUST provide a dispute center with dispute type, status, owner, dispute age, SLA status, amount blocked, linked invoice, and comments timeline.
- **FR-011**: System MUST provide treasury visibility for expected collections, confirmed receipts, unallocated receipts, bank confirmation pending, cash forecast, daily inflow, and entity-level cash view.
- **FR-012**: System MUST provide audit readiness controls for month-end checklist, subledger to GL reconciliation, unapplied cash review, aging sign-off, provision review, dispute review, legal escalation review, exception log, control owner, and evidence status.
- **FR-013**: System MUST provide report-style views for aging summary, entity summary, category summary, 90+ matrix, collector performance, dispute aging, cash allocation, and month-end control pack.
- **FR-014**: System MUST support CSV export for report data when richer Excel export is unavailable.
- **FR-015**: System MUST use realistic local finance data when authoritative backend data is unavailable and label the source limitation.
- **FR-016**: System MUST format currency as AED, dates as day-month-year, and financial numbers with tabular alignment.
- **FR-017**: System MUST provide loading, empty, error, and no-results states for major pages.
- **FR-018**: System MUST maintain keyboard navigability, visible focus states, sufficient contrast, semantic buttons, and readable text.
- **FR-019**: System MUST use subtle motion for page transitions, card entrance, table interaction, drawers, loading states, and chart reveal without distracting infinite animations.

### Key Entities *(include if feature involves data)*

- **Receivable**: Invoice-level AR record with customer, entity, transaction, dates, aging bucket, category, owner, status, risk, original amount, applied amount, and remaining amount.
- **Customer Account**: Customer-level collection context with owner, contact dates, promise-to-pay, escalation, risk, and outstanding exposure.
- **Receipt Allocation**: Bank or receipt record with customer hint, references, amount, suggested match, confidence, and allocation status.
- **Dispute Case**: Blocked receivable issue with type, status, owner, SLA, amount, linked invoice, and timeline.
- **Treasury Position**: Operational cash visibility record with forecast, expected receipts, confirmed receipts, unallocated receipts, bank confirmation, and entity.
- **Control Item**: Audit or month-end readiness task with owner, evidence status, due date, status, and exception state.
- **Report View**: Aggregated finance output for executive or operational review with exportable rows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A finance user can identify total AR, overdue AR, and 90+ exposure within 10 seconds of opening the dashboard.
- **SC-002**: A user can filter receivables to a specific entity, risk, and aging bucket and open a row detail in under 30 seconds.
- **SC-003**: Every required module is reachable from primary navigation without using browser back or hidden commands.
- **SC-004**: At least six finance chart/table views render from realistic data without broken or empty chart frames.
- **SC-005**: All UI-level actions that lack backend integration are visibly labelled as draft-only, review-only, or local state only.
- **SC-006**: The application passes typecheck, lint, and production build before release.
- **SC-007**: Desktop, laptop, and tablet viewport checks show no overlapping text, broken navigation, or unusable tables.

## Assumptions

- The current application is already deployed and must be improved in place.
- Backend finance tables may be unavailable; realistic local seed data is acceptable for this phase.
- The product is an internal finance control application, not a public landing page.
- Real customer emails, ledger writes, banking actions, and workflow integrations are out of scope until their backends are confirmed.
- CSV export is sufficient for the first report/export implementation if Excel export does not already exist.
- Desktop, laptop, and tablet quality are required; mobile may simplify layout but must not break.
