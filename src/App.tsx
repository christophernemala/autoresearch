import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Filter,
  Gauge,
  Inbox,
  Landmark,
  Layers3,
  PanelRightOpen,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  allocations,
  collections as collectionSeed,
  controls,
  disputes,
  entities,
  receivables,
  reportDefinitions,
  treasuryPositions
} from './data/financeSeed';
import {
  agingDistribution,
  buildReports,
  calculateExecutiveMetrics,
  chartPercent,
  downloadCsv,
  formatAed,
  formatDate,
  formatNumber,
  getMax,
  treasuryTotals
} from './lib/finance';
import type {
  AgingBucket,
  AllocationReceipt,
  CollectionAccount,
  ControlItem,
  DisputeCase,
  Receivable,
  RiskLevel,
  TreasuryPosition
} from './types';

type Page = 'dashboard' | 'receivables' | 'collections' | 'allocation' | 'disputes' | 'treasury' | 'controls' | 'reports' | 'settings';
type SortKey = 'amountDue' | 'daysLate' | 'customerName' | 'dueDate';

const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Command Center', icon: Gauge },
  { id: 'receivables', label: 'Receivables', icon: ReceiptText },
  { id: 'collections', label: 'Collections', icon: CalendarClock },
  { id: 'allocation', label: 'Allocation', icon: WalletCards },
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
  { id: 'treasury', label: 'Treasury', icon: Landmark },
  { id: 'controls', label: 'Controls', icon: ClipboardCheck },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
];

const pageCopy: Record<Page, { title: string; kicker: string; description: string }> = {
  dashboard: {
    title: 'Finance Control Hub',
    kicker: 'Executive command view',
    description: 'Receivables exposure, collection pressure, cash allocation, disputes, and month-end readiness in one operating view.'
  },
  receivables: {
    title: 'Receivables Aging',
    kicker: 'AR subledger control',
    description: 'Invoice-level aging with risk, owner, category, and drilldown context for collection action.'
  },
  collections: {
    title: 'Collections Workspace',
    kicker: 'Daily operating queue',
    description: 'Priority accounts, promise-to-pay, escalation, follow-up status, and draft-only customer actions.'
  },
  allocation: {
    title: 'Cash Allocation',
    kicker: 'Unapplied receipt control',
    description: 'Suggested invoice matches and unidentified payments using transparent business-rule confidence.'
  },
  disputes: {
    title: 'Dispute Center',
    kicker: 'Blocked cash resolution',
    description: 'Dispute age, owner, SLA status, linked invoice, amount blocked, and comments timeline.'
  },
  treasury: {
    title: 'Treasury Visibility',
    kicker: 'Operational cash view',
    description: 'Expected collections, confirmed receipts, unallocated cash, pending bank confirmation, and entity cash forecast.'
  },
  controls: {
    title: 'Audit & Controls',
    kicker: 'Month-end readiness',
    description: 'Control owners, evidence status, reconciliation readiness, provision review, and exception logs.'
  },
  reports: {
    title: 'Reports',
    kicker: 'Control pack outputs',
    description: 'Aging, entity, category, 90+ matrix, collector, dispute, allocation, and month-end report views.'
  },
  settings: {
    title: 'Source & Integration Boundaries',
    kicker: 'Deployment-safe configuration',
    description: 'Current source state and integration assumptions. External write actions remain disabled until real services are wired.'
  }
};

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: 'easeOut' }
} as const;

function toneForRisk(risk: RiskLevel) {
  return risk === 'Critical' ? 'critical' : risk === 'High' ? 'warning' : risk === 'Medium' ? 'info' : 'success';
}

function isCurrencyReportKey(key: string) {
  const normalized = key.toLowerCase();
  return ['amount', 'exposure', 'overdue', 'total', 'confirmed', 'forecast', 'unallocated', 'pending'].some((token) => normalized.includes(token));
}

function AppShell({ page, setPage, children }: { page: Page; setPage: (page: Page) => void; children: React.ReactNode }) {
  const copy = pageCopy[page];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('dashboard')} aria-label="Open executive dashboard">
          <span>DH</span>
          <div>
            <strong>Finance</strong>
            <small>Finance Control</small>
          </div>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <section className="source-card">
          <ShieldCheck size={18} />
          <div>
            <strong>Review-only mode</strong>
            <p>Local finance seed data is active. Ledger, bank, and email actions are not executed.</p>
          </div>
        </section>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
          <div className="topbar-actions">
            <button className="toolbar-button"><Inbox size={15} /> Import</button>
            <button className="toolbar-button"><Download size={15} /> Export</button>
            <button className="toolbar-button primary">Review queue</button>
          </div>
        </header>
        <div className="workspace-bar">
          <div>
            <span>Open period</span>
            <strong>Jun 2026 close</strong>
          </div>
          <div>
            <span>Currency</span>
            <strong>AED</strong>
          </div>
          <div>
            <span>Source</span>
            <strong>Local finance data</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>Review only</strong>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={page} {...pageTransition}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export function App() {
  const [page, setPage] = useState<Page>('receivables');
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [bucketFilter, setBucketFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('amountDue');
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [collections, setCollections] = useState(collectionSeed);
  const reports = useMemo(() => buildReports(reportDefinitions, receivables, entities, collections, allocations, disputes, controls), [collections]);

  const filteredReceivables = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return receivables
      .filter((record) => {
        const searchText = `${record.customerName} ${record.customerNumber} ${record.transactionNumber} ${record.transactionDescription} ${record.owner}`.toLowerCase();
        return (
          (!normalizedQuery || searchText.includes(normalizedQuery)) &&
          (entityFilter === 'All' || record.entity === entityFilter) &&
          (categoryFilter === 'All' || record.category === categoryFilter) &&
          (bucketFilter === 'All' || record.bucket === bucketFilter) &&
          (riskFilter === 'All' || record.risk === riskFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === 'customerName') return a.customerName.localeCompare(b.customerName);
        if (sortKey === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return b[sortKey] - a[sortKey];
      });
  }, [bucketFilter, categoryFilter, entityFilter, query, riskFilter, sortKey]);

  function resetFilters() {
    setQuery('');
    setEntityFilter('All');
    setCategoryFilter('All');
    setBucketFilter('All');
    setRiskFilter('All');
    setSortKey('amountDue');
  }

  function markFollowedUp(id: string) {
    setCollections((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              followUpStatus: 'Contacted',
              lastContactDate: '2026-06-24',
              notes: ['Follow-up marked complete in local review state.', ...item.notes]
            }
          : item
      )
    );
  }

  function escalate(id: string) {
    setCollections((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              followUpStatus: 'Escalated',
              escalationStatus: item.escalationStatus === 'None' ? 'Finance Manager' : item.escalationStatus,
              notes: ['Escalation prepared for approval. No external system updated.', ...item.notes]
            }
          : item
      )
    );
  }

  return (
    <AppShell page={page} setPage={setPage}>
      {page === 'dashboard' && <Dashboard setPage={setPage} />}
      {page === 'receivables' && (
        <ReceivablesPage
          rows={filteredReceivables}
          query={query}
          setQuery={setQuery}
          entityFilter={entityFilter}
          setEntityFilter={setEntityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          bucketFilter={bucketFilter}
          setBucketFilter={setBucketFilter}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          sortKey={sortKey}
          setSortKey={setSortKey}
          resetFilters={resetFilters}
          onSelect={setSelectedReceivable}
        />
      )}
      {page === 'collections' && <CollectionsPage rows={collections} onFollowUp={markFollowedUp} onEscalate={escalate} />}
      {page === 'allocation' && <AllocationPage rows={allocations} />}
      {page === 'disputes' && <DisputesPage rows={disputes} />}
      {page === 'treasury' && <TreasuryPage rows={treasuryPositions} />}
      {page === 'controls' && <ControlsPage rows={controls} />}
      {page === 'reports' && <ReportsPage reports={reports} />}
      {page === 'settings' && <SettingsPage />}
      <DetailDrawer record={selectedReceivable} onClose={() => setSelectedReceivable(null)} />
    </AppShell>
  );
}

function Dashboard({ setPage }: { setPage: (page: Page) => void }) {
  const metrics = calculateExecutiveMetrics(entities, receivables, allocations, disputes, controls);
  const distribution = agingDistribution(receivables);
  const entityMax = getMax(entities, (entity) => entity.totalAr);
  const priority = [...receivables].sort((a, b) => b.amountDue - a.amountDue).slice(0, 5);

  return (
    <section className="page-stack">
      <div className="kpi-grid">
        <KpiCard title="Total AR" value={formatAed(metrics.totalAr, true)} trend="+3.8% vs prior close" tone="info" />
        <KpiCard title="Overdue AR" value={formatAed(metrics.overdueAr, true)} trend="43.1% of exposure" tone="warning" />
        <KpiCard title="90+ overdue" value={formatAed(metrics.ninetyPlus, true)} trend="91-180 + 181-360 + 361+" tone="critical" />
        <KpiCard title="Month-end readiness" value={`${metrics.readinessScore}%`} trend="Controls reviewed or signed off" tone="success" />
        <KpiCard title="DSO" value={metrics.weightedDso.toFixed(1)} trend="Weighted by entity AR" tone="info" />
        <KpiCard title="CEI" value={`${metrics.weightedCei.toFixed(1)}%`} trend="Operational estimate" tone="success" />
        <KpiCard title="Unapplied cash" value={formatAed(metrics.unappliedCash, true)} trend="Allocation review queue" tone="warning" />
        <KpiCard title="Disputed amount" value={formatAed(metrics.disputedAmount, true)} trend={`${metrics.highRiskCustomers} high-risk customers`} tone="critical" />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Aging Distribution" kicker="Outstanding by bucket" action={<button onClick={() => setPage('receivables')}>Open aging <ChevronRight size={15} /></button>}>
          <BarList rows={distribution.map((row) => ({ label: row.bucket, value: row.amount }))} />
        </SectionCard>
        <SectionCard title="Entity Exposure" kicker="Total AR by legal entity">
          <div className="entity-list">
            {entities.map((entity) => (
              <div className="entity-row" key={entity.entity}>
                <div>
                  <strong>{entity.entity}</strong>
                  <span>{entity.legalName}</span>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${chartPercent(entity.totalAr, entityMax)}%` }} />
                </div>
                <strong className="amount">{formatAed(entity.totalAr, true)}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Collection Priority" kicker="Largest current operational exceptions" className="wide">
          <div className="priority-list">
            {priority.map((record) => (
              <button key={record.id} onClick={() => setPage('receivables')}>
                <div>
                  <strong>{record.customerName}</strong>
                  <span>{record.transactionNumber} · {record.bucket} · {record.owner}</span>
                </div>
                <StatusBadge tone={toneForRisk(record.risk)}>{record.risk}</StatusBadge>
                <strong className="amount">{formatAed(record.amountDue, true)}</strong>
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Operational Exceptions" kicker="Controls requiring attention">
          <ExceptionList />
        </SectionCard>
      </div>
    </section>
  );
}

function ReceivablesPage(props: {
  rows: Receivable[];
  query: string;
  setQuery: (value: string) => void;
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  bucketFilter: string;
  setBucketFilter: (value: string) => void;
  riskFilter: string;
  setRiskFilter: (value: string) => void;
  sortKey: SortKey;
  setSortKey: (value: SortKey) => void;
  resetFilters: () => void;
  onSelect: (record: Receivable) => void;
}) {
  const entitiesList = ['All', ...Array.from(new Set(receivables.map((record) => record.entity)))];
  const categories = ['All', ...Array.from(new Set(receivables.map((record) => record.category)))];
  const buckets: ('All' | AgingBucket)[] = ['All', 'Current', '1-30', '31-60', '61-90', '91-180', '181-360', '361+'];
  const risks: ('All' | RiskLevel)[] = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const total = props.rows.reduce((sum, row) => sum + row.amountDue, 0);
  const ninety = props.rows.filter((row) => ['91-180', '181-360', '361+'].includes(row.bucket)).reduce((sum, row) => sum + row.amountDue, 0);

  return (
    <section className="page-stack">
      <FilterBar>
        <SearchInput value={props.query} onChange={props.setQuery} placeholder="Search customer, invoice, owner..." />
        <Select label="Entity" value={props.entityFilter} onChange={props.setEntityFilter} options={entitiesList} />
        <Select label="Category" value={props.categoryFilter} onChange={props.setCategoryFilter} options={categories} />
        <Select label="Bucket" value={props.bucketFilter} onChange={props.setBucketFilter} options={buckets} />
        <Select label="Risk" value={props.riskFilter} onChange={props.setRiskFilter} options={risks} />
        <Select label="Sort" value={props.sortKey} onChange={(value) => props.setSortKey(value as SortKey)} options={['amountDue', 'daysLate', 'customerName', 'dueDate']} />
        <button className="ghost-button" onClick={props.resetFilters}>Reset</button>
      </FilterBar>

      <div className="summary-strip">
        <MetricPill label="Filtered amount" value={formatAed(total, true)} />
        <MetricPill label="90+ in view" value={formatAed(ninety, true)} />
        <MetricPill label="Records" value={formatNumber(props.rows.length)} />
      </div>

      <SectionCard title="Aging Work Queue" kicker="Invoice-level operating register">
        {props.rows.length === 0 ? (
          <EmptyState title="No receivables match these filters" body="Reset filters or broaden the search to review the full aging population." action={<button onClick={props.resetFilters}>Reset filters</button>} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Entity</th>
                  <th>Transaction</th>
                  <th>Due date</th>
                  <th className="num">Days late</th>
                  <th>Bucket</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th className="num">Amount due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {props.rows.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.customerName}</strong>
                      <span>{record.customerNumber}</span>
                    </td>
                    <td>{record.entity}</td>
                    <td>
                      <strong>{record.transactionNumber}</strong>
                      <span>{record.transactionDescription}</span>
                    </td>
                    <td>{formatDate(record.dueDate)}</td>
                    <td className="num">{record.daysLate}</td>
                    <td><AgingBucketBadge bucket={record.bucket} /></td>
                    <td>{record.category}</td>
                    <td>{record.owner}</td>
                    <td><StatusBadge tone="neutral">{record.status}</StatusBadge></td>
                    <td><StatusBadge tone={toneForRisk(record.risk)}>{record.risk}</StatusBadge></td>
                    <td className="num amount">{formatAed(record.amountDue)}</td>
                    <td><button className="icon-button" onClick={() => props.onSelect(record)} aria-label={`Open ${record.transactionNumber}`}><PanelRightOpen size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </section>
  );
}

function CollectionsPage({ rows, onFollowUp, onEscalate }: { rows: CollectionAccount[]; onFollowUp: (id: string) => void; onEscalate: (id: string) => void }) {
  return (
    <section className="page-stack">
      <div className="module-grid">
        {rows.map((row) => (
          <SectionCard key={row.id} title={row.customerName} kicker={`${row.entity} · ${row.owner}`}>
            <div className="collection-card">
              <div className="collection-metrics">
                <MetricPill label="Exposure" value={formatAed(row.exposure, true)} />
                <MetricPill label="90+ overdue" value={formatAed(row.overdue90, true)} />
                <MetricPill label="Next action" value={formatDate(row.nextActionDate)} />
              </div>
              <div className="state-row">
                <StatusBadge tone={row.priority === 'Today' ? 'critical' : row.priority === 'This Week' ? 'warning' : 'info'}>{row.priority}</StatusBadge>
                <StatusBadge tone={row.legalEscalation ? 'critical' : row.paymentPlan ? 'info' : 'neutral'}>{row.followUpStatus}</StatusBadge>
                <StatusBadge tone="warning">{row.escalationStatus}</StatusBadge>
                <StatusBadge tone="info">Draft only</StatusBadge>
              </div>
              <ul className="notes-list">
                {row.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
              <div className="action-row">
                <button onClick={() => onFollowUp(row.id)}><CheckCircle2 size={15} /> Mark followed up</button>
                <button className="secondary-action" onClick={() => onEscalate(row.id)}><ArrowUpRight size={15} /> Escalate</button>
                <button className="secondary-action"><FileSpreadsheet size={15} /> Generate draft</button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

function AllocationPage({ rows }: { rows: AllocationReceipt[] }) {
  return (
    <section className="page-stack">
      <SectionCard title="Unapplied Receipts" kicker="Transparent business-rule matching, no automated ledger posting">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Bank reference</th>
                <th>Customer hint</th>
                <th>Suggested match</th>
                <th>Reason</th>
                <th className="num">Confidence</th>
                <th>Status</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.id}</strong><span>{formatDate(row.receiptDate)} · {row.bankAccount}</span></td>
                  <td>{row.bankReference}<span>{row.proofReference}</span></td>
                  <td>{row.customerHint}</td>
                  <td><strong>{row.suggestedCustomer}</strong><span>{row.suggestedInvoice}</span></td>
                  <td>{row.matchReason}</td>
                  <td className="num"><Confidence value={row.confidence} /></td>
                  <td><StatusBadge tone={row.status === 'Unidentified' ? 'critical' : row.status === 'Manual Review' ? 'warning' : 'info'}>{row.status}</StatusBadge></td>
                  <td className="num amount">{formatAed(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  );
}

function DisputesPage({ rows }: { rows: DisputeCase[] }) {
  return (
    <section className="page-stack">
      <div className="module-grid">
        {rows.map((row) => (
          <SectionCard key={row.id} title={row.id} kicker={`${row.type} · ${row.customerName}`}>
            <div className="dispute-card">
              <div className="state-row">
                <StatusBadge tone={row.slaStatus === 'Breached' ? 'critical' : row.slaStatus === 'Due Soon' ? 'warning' : 'success'}>{row.slaStatus}</StatusBadge>
                <StatusBadge tone="neutral">{row.status}</StatusBadge>
                <StatusBadge tone="info">{row.owner}</StatusBadge>
              </div>
              <div className="collection-metrics">
                <MetricPill label="Blocked amount" value={formatAed(row.amountBlocked, true)} />
                <MetricPill label="Age" value={`${row.ageDays} days`} />
                <MetricPill label="Invoice" value={row.linkedInvoice} />
              </div>
              <ol className="timeline">
                {row.timeline.map((event) => <li key={event}>{event}</li>)}
              </ol>
            </div>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

function TreasuryPage({ rows }: { rows: TreasuryPosition[] }) {
  const totals = treasuryTotals(rows);
  const max = getMax(rows, (row) => row.forecast30Days);
  return (
    <section className="page-stack">
      <div className="kpi-grid compact">
        <KpiCard title="Expected collections" value={formatAed(totals.expected, true)} trend="Next operating cycle" tone="info" />
        <KpiCard title="Confirmed receipts" value={formatAed(totals.confirmed, true)} trend="Bank-confirmed today" tone="success" />
        <KpiCard title="Unallocated receipts" value={formatAed(totals.unallocated, true)} trend="Allocation queue" tone="warning" />
        <KpiCard title="Bank pending" value={formatAed(totals.pending, true)} trend="Confirmation required" tone="critical" />
      </div>
      <SectionCard title="Entity Cash Forecast" kicker="7-day and 30-day operational inflow visibility">
        <div className="entity-list">
          {rows.map((row) => (
            <div className="entity-row" key={row.id}>
              <div>
                <strong>{row.entity}</strong>
                <span>{formatDate(row.date)} · 7-day {formatAed(row.forecast7Days, true)}</span>
              </div>
              <div className="bar-track">
                <span style={{ width: `${chartPercent(row.forecast30Days, max)}%` }} />
              </div>
              <strong className="amount">{formatAed(row.forecast30Days, true)}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

function ControlsPage({ rows }: { rows: ControlItem[] }) {
  return (
    <section className="page-stack">
      <SectionCard title="Month-end Control Checklist" kicker="Evidence, owner, due date, status, and exception count">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Control</th>
                <th>Owner</th>
                <th>Due date</th>
                <th>Status</th>
                <th>Evidence</th>
                <th className="num">Exceptions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.area}</td>
                  <td><strong>{row.control}</strong></td>
                  <td>{row.owner}</td>
                  <td>{formatDate(row.dueDate)}</td>
                  <td><StatusBadge tone={row.status === 'Signed Off' || row.status === 'Reviewed' ? 'success' : row.status === 'Pending Evidence' ? 'warning' : 'neutral'}>{row.status}</StatusBadge></td>
                  <td><StatusBadge tone={row.evidenceStatus === 'Missing' ? 'critical' : row.evidenceStatus === 'Requested' ? 'warning' : 'info'}>{row.evidenceStatus}</StatusBadge></td>
                  <td className="num">{row.exceptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </section>
  );
}

function ReportsPage({ reports }: { reports: ReturnType<typeof buildReports> }) {
  const [activeReport, setActiveReport] = useState(reports[0]);
  return (
    <section className="reports-layout">
      <aside className="report-nav">
        {reports.map((report) => (
          <button key={report.id} className={activeReport.id === report.id ? 'active' : ''} onClick={() => setActiveReport(report)}>
            <strong>{report.title}</strong>
            <span>{report.description}</span>
          </button>
        ))}
      </aside>
      <SectionCard
        title={activeReport.title}
        kicker={activeReport.description}
        action={<button disabled={activeReport.rows.length === 0} onClick={() => downloadCsv(`${activeReport.id}.csv`, activeReport.rows)}><Download size={15} /> Export CSV</button>}
      >
        {activeReport.rows.length === 0 ? (
          <EmptyState title="No report rows available" body="This report has no rows from the current local source." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{Object.keys(activeReport.rows[0]).map((key) => <th key={key}>{key}</th>)}</tr>
              </thead>
              <tbody>
                {activeReport.rows.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key} className={typeof value === 'number' ? 'num' : ''}>{typeof value === 'number' && isCurrencyReportKey(key) ? formatAed(value, true) : String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </section>
  );
}

function SettingsPage() {
  const rows = [
    ['Finance source', 'Local realistic seed data', 'Active'],
    ['Supabase finance schema', 'Repository fallback exists', 'Not required for this build'],
    ['Email sending', 'No backend service wired', 'Draft only'],
    ['Ledger allocation', 'No ERP write integration wired', 'Review only'],
    ['Vercel deployment', 'Existing project configuration preserved', 'Active']
  ];
  return (
    <section className="page-stack">
      <SectionCard title="Integration Boundaries" kicker="No unverified backend claims">
        <div className="settings-grid">
          {rows.map(([label, detail, state]) => (
            <div key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
              <StatusBadge tone={state === 'Active' ? 'success' : 'warning'}>{state}</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

function KpiCard({ title, value, trend, tone }: { title: string; value: string; trend: string; tone: 'success' | 'warning' | 'critical' | 'info' }) {
  const TrendIcon = tone === 'critical' || tone === 'warning' ? ArrowUpRight : ArrowDownRight;
  return (
    <motion.div className={`kpi-card ${tone}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <span>{title}</span>
      <strong>{value}</strong>
      <em><TrendIcon size={14} /> {trend}</em>
    </motion.div>
  );
}

function SectionCard({ title, kicker, action, className = '', children }: { title: string; kicker: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`section-card ${className}`}>
      <header>
        <div>
          <span className="eyebrow">{kicker}</span>
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusBadge({ tone, children }: { tone: 'success' | 'warning' | 'critical' | 'info' | 'neutral'; children: React.ReactNode }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

function AgingBucketBadge({ bucket }: { bucket: AgingBucket }) {
  const tone = bucket === 'Current' ? 'success' : bucket === '1-30' || bucket === '31-60' ? 'info' : bucket === '61-90' ? 'warning' : 'critical';
  return <StatusBadge tone={tone}>{bucket}</StatusBadge>;
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="filter-bar"><Filter size={17} />{children}</div>;
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="search-input">
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = getMax(rows, (row) => row.value);
  return (
    <div className="bar-list">
      {rows.map((row) => (
        <div key={row.label}>
          <div>
            <strong>{row.label}</strong>
            <span>{formatAed(row.value, true)}</span>
          </div>
          <div className="bar-track">
            <motion.span initial={{ width: 0 }} animate={{ width: `${chartPercent(row.value, max)}%` }} transition={{ duration: 0.45 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  return (
    <div className="confidence">
      <div><span style={{ width: `${value}%` }} /></div>
      <strong>{value}%</strong>
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <Layers3 size={24} />
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function ExceptionList() {
  const exceptions = [
    { label: 'Provision review not started', value: 'AED 64.1M 90+ exposure', tone: 'critical' as const },
    { label: 'Subledger evidence pending', value: '2 reconciliation exceptions', tone: 'warning' as const },
    { label: 'Unapplied cash above threshold', value: '4 receipts require review', tone: 'warning' as const },
    { label: 'Dispute SLA breached', value: 'Business district LPO issue', tone: 'critical' as const }
  ];
  return (
    <div className="exception-list">
      {exceptions.map((item) => (
        <div key={item.label}>
          <StatusBadge tone={item.tone}>{item.tone}</StatusBadge>
          <strong>{item.label}</strong>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DetailDrawer({ record, onClose }: { record: Receivable | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {record && (
        <motion.aside className="drawer" initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
          <header>
            <div>
              <span className="eyebrow">Receivable detail</span>
              <h2>{record.transactionNumber}</h2>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close drawer"><X size={17} /></button>
          </header>
          <div className="drawer-body">
            <strong>{record.customerName}</strong>
            <p>{record.transactionDescription}</p>
            <div className="drawer-grid">
              <MetricPill label="Original amount" value={formatAed(record.originalAmount, true)} />
              <MetricPill label="Applied amount" value={formatAed(record.appliedAmount, true)} />
              <MetricPill label="Remaining" value={formatAed(record.amountDue, true)} />
              <MetricPill label="Days late" value={String(record.daysLate)} />
            </div>
            <div className="state-row">
              <AgingBucketBadge bucket={record.bucket} />
              <StatusBadge tone={toneForRisk(record.risk)}>{record.risk}</StatusBadge>
              <StatusBadge tone="neutral">{record.status}</StatusBadge>
            </div>
            <dl>
              <div><dt>Entity</dt><dd>{record.entity}</dd></div>
              <div><dt>Category</dt><dd>{record.category}</dd></div>
              <div><dt>Owner</dt><dd>{record.owner}</dd></div>
              <div><dt>Invoice date</dt><dd>{formatDate(record.invoiceDate)}</dd></div>
              <div><dt>Due date</dt><dd>{formatDate(record.dueDate)}</dd></div>
              <div><dt>Next action</dt><dd>{formatDate(record.nextActionDate)}</dd></div>
            </dl>
            <div className="drawer-note">
              <strong>Control note</strong>
              <p>{record.notes}</p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default App;
