<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> Finance Workflow Fidelity
- [PRINCIPLE_2_NAME] -> Truthful Data And Integration Boundaries
- [PRINCIPLE_3_NAME] -> Enterprise UI Quality
- [PRINCIPLE_4_NAME] -> Controls, Auditability, And Accessibility
- [PRINCIPLE_5_NAME] -> Verification Before Release
Added sections:
- Product Scope
- Engineering Workflow
Removed sections:
- Placeholder SECTION_2_NAME
- Placeholder SECTION_3_NAME
Templates requiring updates:
- .specify/templates/plan-template.md: reviewed, no update required
- .specify/templates/spec-template.md: reviewed, no update required
- .specify/templates/tasks-template.md: reviewed, no update required
Follow-up TODOs:
- None
-->

# Finance Control Hub Constitution

## Core Principles

### Finance Workflow Fidelity
The product MUST model finance operations as receivables, collections,
reconciliations, cash allocation, disputes, treasury visibility, controls, and
reports. Every screen MUST expose business states, owners, dates, amounts, and
exceptions that a finance operations team can act on. Features that only create
generic dashboard decoration or chat-first experiences are not acceptable.

### Truthful Data And Integration Boundaries
The application MUST distinguish connected data from seed or mock data. UI
actions MUST NOT claim to send emails, execute allocations, update ledgers, or
call external systems unless the integration exists and is wired. Derived
metrics such as DSO, CEI, 90+ overdue, risk, and SLA status MUST be calculated
from visible assumptions or labelled as operational estimates.

### Enterprise UI Quality
The interface MUST use a centralized design system for color, typography,
spacing, surfaces, radius, shadows, badges, tables, and motion. The product MUST
feel calm, premium, dense, and executive-ready. Random gradients, neon clutter,
oversized marketing heroes, childish animations, and placeholder-heavy screens
are prohibited.

### Controls, Auditability, And Accessibility
Finance workflows MUST preserve reviewability: status badges, evidence states,
owners, exception logs, and clear draft-only labels are required where actions
could affect customers or ledgers. Interactive elements MUST remain keyboard
navigable with visible focus states, sufficient contrast, semantic controls, and
readable table density across desktop, laptop, and tablet widths.

### Verification Before Release
Changes MUST pass typecheck, lint, and production build before deployment or
merge recommendation. Build/deployment configuration MUST remain intact unless a
change explicitly requires it. Visual changes MUST be reviewed in a browser when
they affect layout, navigation, charts, drawers, tables, or responsive behavior.

## Product Scope

Finance Control Hub is a production-grade finance operations and O2C
control platform for receivables, collections, reconciliations, disputes,
allocations, treasury visibility, audit readiness, and executive reporting.

The product targets finance operations and real estate finance teams. It may use
realistic local seed data when backend data is unavailable, but it MUST avoid
private customer data and MUST label source limitations. Initial scope is
finance operations visibility and UI-level workflow preparation; irreversible
ledger, banking, email, or customer-facing actions require real integrations and
explicit approval controls.

## Engineering Workflow

Implementation MUST preserve the existing deployment path and improve the
current project incrementally. Components and utilities SHOULD be reusable when
shared behavior exists across modules, especially tables, badges, detail
drawers, amount formatting, date formatting, aging calculations, filters, empty
states, loading states, and chart primitives.

Each feature slice MUST be independently testable through the running UI and the
standard project commands. Pull requests or commits SHOULD separate product
scaffolding, data/model changes, UI refactors, and dependency changes when that
improves reviewability.

## Governance

This constitution supersedes ad hoc styling or feature decisions for this
project. Amendments require a documented reason, semantic version bump, and a
review of affected specs, plans, tasks, and runtime guidance.

Versioning follows semantic versioning:
- MAJOR for incompatible changes to product governance or required quality gates.
- MINOR for new principles or materially expanded product constraints.
- PATCH for clarifications that do not change obligations.

All implementation plans and reviews MUST check compliance with these
principles. Non-compliant work must be corrected before release unless the
exception is explicitly documented with owner, rationale, and remediation date.

**Version**: 1.0.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24
