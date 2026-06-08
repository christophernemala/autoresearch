import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  KeyRound,
  Landmark,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Upload,
  Users
} from 'lucide-react';
import { createRouteContext, shouldShowAgentWidget } from './lib/agent';
import { ORACLE_AGING_BUCKET_COLUMNS, ORACLE_AR_REQUIRED_COLUMNS } from './lib/oracleImport';
import { requireSupabaseSetup, supabaseConfigured } from './lib/supabaseClient';
import { agentActions, bankTransactions, customers, entities, formatAed, importResults, invoices } from './data/dhcmSeed';
import type { AgentAction, AgentContext, EntityAging, Role, UserSession } from './types';

type ModalState = {
  title: string;
  body: string;
  action?: string;
};

type AuditEvent = {
  id: string;
  action: string;
  details: string;
  createdAt: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const appRoutes = [
  ['Dashboard', '/app/dashboard', Activity],
  ['AR Control', '/ar', CircleDollarSign],
  ['Customers', '/app/customers', Users],
  ['Imports', '/app/imports', Upload],
  ['Banking', '/app/banking', Landmark],
  ['Reconciliation', '/app/reconciliation', RefreshCw],
  ['Agent', '/app/agent', Bot],
  ['Exports', '/app/exports', FileSpreadsheet],
  ['Files', '/app/files', FolderOpen],
  ['Reports', '/app/reports', ClipboardList],
  ['Emails', '/app/emails', Mail],
  ['Settings', '/app/settings', ShieldCheck],
  ['Audit', '/app/audit', Lock]
] as const;

const chartColors = ['#24c1c9', '#38d996', '#ffcf70', '#8fb7ff', '#ff8d8d'];

export function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(loadUserSession);
  const [reviewableActions, setReviewableActions] = useState<AgentAction[]>(loadReviewableActions);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(loadAuditEvents);
  const agentContext = useMemo(() => createRouteContext(path, search), [path, search]);

  function navigate(nextPath: string) {
    window.history.pushState(null, '', nextPath);
    setPath(window.location.pathname);
    setSearch(window.location.search);
  }

  window.onpopstate = () => {
    setPath(window.location.pathname);
    setSearch(window.location.search);
  };

  const workflow = (title: string, body: string, action = 'Create reviewable record') => {
    setModal({ title, body, action });
  };

  const createReviewableRecord = (request: ModalState) => {
    const now = new Date().toISOString();
    const record: AgentAction = {
      id: `local-${Date.now()}`,
      title: request.title,
      description: request.body,
      status: 'pending_approval',
      riskLevel: inferRisk(request.title),
      createdAt: now
    };
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}`,
      action: 'reviewable_record_created',
      details: `${request.title} queued through safe approval workflow.`,
      createdAt: now
    };
    const nextActions = [record, ...reviewableActions].slice(0, 12);
    const nextAudit = [auditEvent, ...auditEvents].slice(0, 20);
    setReviewableActions(nextActions);
    setAuditEvents(nextAudit);
    localStorage.setItem('dhcm.reviewableActions', JSON.stringify(nextActions));
    localStorage.setItem('dhcm.auditEvents', JSON.stringify(nextAudit));
    setModal(null);
  };

  const startLocalSession = (email: string, role: Role) => {
    const session: UserSession = {
      id: `local-user-${Date.now()}`,
      email,
      fullName: email.split('@')[0] || 'Finance User',
      role,
      source: supabaseConfigured ? 'supabase' : 'local_review'
    };
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}`,
      action: 'login',
      details: `${session.email} started a ${session.source === 'local_review' ? 'local review' : 'Supabase'} session as ${session.role}.`,
      createdAt: new Date().toISOString()
    };
    const nextAudit = [auditEvent, ...auditEvents].slice(0, 20);
    setCurrentUser(session);
    setAuditEvents(nextAudit);
    localStorage.setItem('dhcm.userSession', JSON.stringify(session));
    localStorage.setItem('dhcm.auditEvents', JSON.stringify(nextAudit));
    navigate('/app/dashboard');
  };

  const logout = () => {
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}`,
      action: 'logout',
      details: `${currentUser?.email || 'Unknown user'} ended the session.`,
      createdAt: new Date().toISOString()
    };
    const nextAudit = [auditEvent, ...auditEvents].slice(0, 20);
    setCurrentUser(null);
    setAuditEvents(nextAudit);
    localStorage.removeItem('dhcm.userSession');
    localStorage.setItem('dhcm.auditEvents', JSON.stringify(nextAudit));
    navigate('/login');
  };

  const page = renderRoute(path, navigate, workflow, agentContext, reviewableActions, auditEvents);
  const isAuth = ['/login', '/signup', '/forgot-password'].includes(path);
  const isLanding = path === '/';

  return (
    <div className={isLanding ? 'landing-app' : 'app-root'}>
      {isLanding ? (
        <LandingPage navigate={navigate} />
      ) : isAuth ? (
        <AuthPage path={path} navigate={navigate} workflow={workflow} onAuth={startLocalSession} />
      ) : !currentUser ? (
        <ProtectedGate navigate={navigate} workflow={workflow} />
      ) : (
        <AppLayout path={path} navigate={navigate} user={currentUser} onLogout={logout}>
          {page}
          {shouldShowAgentWidget(path) ? <FloatingAgent context={agentContext} workflow={workflow} /> : null}
        </AppLayout>
      )}
      {modal ? <WorkflowModal modal={modal} onClose={() => setModal(null)} onConfirm={() => createReviewableRecord(modal)} /> : null}
    </div>
  );
}

function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <header className="public-nav">
        <button className="brand-button" onClick={() => navigate('/')}>
          <span className="brand-mark">D</span>
          <span>
            <strong>DHCM</strong>
            <small>Finance Control Hub</small>
          </span>
        </button>
        <nav>
          <button onClick={() => navigate('/app/dashboard')}>Modules</button>
          <button onClick={() => navigate('/app/reconciliation')}>Workflows</button>
          <button onClick={() => navigate('/app/agent')}>AI Agent</button>
          <button onClick={() => navigate('/app/settings')}>Security</button>
        </nav>
        <div className="nav-actions">
          <button className="ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="nav-launch" onClick={() => navigate('/app/dashboard')}>Launch console <ArrowRight size={16} /></button>
        </div>
      </header>
      <main className="hero">
        <section className="hero-copy">
          <span className="eyebrow">Built for Dubai Holdings - AED - Asia/Dubai</span>
          <h1>The finance control plane for <em>multi-entity</em> holdings.</h1>
          <p>Unify order-to-cash collections, credit control, asset management, and executive analytics in a single audit-ready workspace with an AI agent that never acts without approval.</p>
          <div className="hero-actions">
            <button className="primary large" onClick={() => navigate('/app/dashboard')}>Launch console <ArrowRight size={17} /></button>
            <button className="hero-secondary large" onClick={() => navigate('/ar')}>Explore modules</button>
          </div>
          <div className="hero-stats">
            <strong>{formatAed(totalAr())}</strong><span>AR under management</span>
            <strong>47</strong><span>group entities</span>
            <strong>99.97%</strong><span>reconciliation accuracy target</span>
          </div>
        </section>
        <section className="preview-card">
          <div className="window-dots"><span /><span /><span /> DHCM - Executive Dashboard - Asia/Dubai</div>
          <div className="preview-kpis">
            <MetricCard label="Total AR" value={formatAed(totalAr())} delta="+3.1%" />
            <MetricCard label="Overdue" value={formatAed(totalOverdue())} delta="-1.8%" />
            <MetricCard label="DSO" value="58.4" delta="+4.2" warning />
          </div>
          <MiniAgingChart />
          <div className="agent-strip"><Bot size={16} /> Agent: Prioritize 91+ day invoices above AED 250k. Draft prepared and awaiting approval.</div>
        </section>
      </main>
      <section className="modules-band" id="modules">
        <span className="section-kicker">Modules</span>
        <h2>Every finance discipline.<br />One operating system.</h2>
        <p>Replace fragmented spreadsheets and per-entity portals with a unified, audit-ready workspace.</p>
        <div className="module-teasers">
          {[
            ['AR Control', 'Aging, DSO, CEI, ECL, unapplied cash, and entity exposure.'],
            ['Customer Workspace', 'SOA, documents, payments, disputes, promises, and contacts in context.'],
            ['AI Agent', 'Finance recommendations and drafts that require approval before execution.']
          ].map(([title, body]) => (
            <button key={title} onClick={() => navigate(title === 'AI Agent' ? '/app/agent' : title === 'AR Control' ? '/ar' : '/app/customers')}>
              <strong>{title}</strong>
              <span>{body}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function AppLayout({ path, navigate, user, onLogout, children }: { path: string; navigate: (path: string) => void; user: UserSession; onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className="console">
      <aside className="sidebar">
        <button className="brand-button console-brand" onClick={() => navigate('/app/dashboard')}>
          <span className="brand-mark">D</span>
          <span><strong>DHCM</strong><small>Control Hub</small></span>
        </button>
        <nav className="side-nav">
          {appRoutes.map(([label, route, Icon]) => (
            <button key={route} className={path === route || (route === '/app/customers' && path.startsWith('/app/customers')) ? 'active' : ''} onClick={() => navigate(route)}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Production workspace - Asia/Dubai</span>
            <h1>{titleForPath(path)}</h1>
          </div>
          <div className="top-actions">
            <span className={supabaseConfigured ? 'status ok' : 'status warn'}>{supabaseConfigured ? 'Supabase connected' : 'Setup required'}</span>
            <span className="status role">{user.role}</span>
            <button className="secondary" onClick={() => window.history.back()}>Back</button>
            <button className="ghost" onClick={onLogout}><LogOut size={16} /> Logout</button>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}

function renderRoute(
  path: string,
  navigate: (path: string) => void,
  workflow: (title: string, body: string, action?: string) => void,
  context: AgentContext,
  reviewableActions: AgentAction[],
  auditEvents: AuditEvent[]
) {
  if (path === '/app/dashboard') return <DashboardPage navigate={navigate} workflow={workflow} reviewableActions={reviewableActions} />;
  if (path === '/ar') return <ArPage workflow={workflow} />;
  if (path === '/app/customers') return <CustomersPage navigate={navigate} workflow={workflow} />;
  if (path.startsWith('/app/customers/')) {
    const segments = path.split('/');
    return <CustomerWorkspace customerId={segments[segments.length - 1] || ''} workflow={workflow} auditEvents={auditEvents} />;
  }
  if (path === '/app/imports' || path === '/app/integrations/oracle-fusion') return <ImportsPage workflow={workflow} />;
  if (path === '/app/banking') return <BankingPage workflow={workflow} />;
  if (path === '/app/reconciliation') return <ReconciliationPage workflow={workflow} />;
  if (path === '/app/agent') return <AgentCommandCenter context={context} workflow={workflow} reviewableActions={reviewableActions} auditEvents={auditEvents} />;
  if (path === '/app/exports') return <ExportsPage workflow={workflow} />;
  if (path === '/app/files') return <FileManagerPage navigate={navigate} workflow={workflow} />;
  if (path === '/app/reports') return <ReportsPage workflow={workflow} />;
  if (path === '/app/emails') return <EmailsPage workflow={workflow} />;
  if (path === '/app/settings' || path === '/app/mcp-tools' || path === '/app/admin/diagnostics') return <SettingsPage path={path} workflow={workflow} />;
  if (path === '/app/audit') return <AuditPage auditEvents={auditEvents} />;
  return <DashboardPage navigate={navigate} workflow={workflow} reviewableActions={reviewableActions} />;
}

function AuthPage({ path, navigate, workflow, onAuth }: { path: string; navigate: (path: string) => void; workflow: (title: string, body: string, action?: string) => void; onAuth: (email: string, role: Role) => void }) {
  const title = path === '/signup' ? 'Create your DHCM account' : path === '/forgot-password' ? 'Reset password' : 'Sign in';
  const [email, setEmail] = useState('finance@dhcm.example');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Finance User');
  const [error, setError] = useState('');
  const submitAuth = () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid work email address.');
      return;
    }
    if (path === '/forgot-password') {
      workflow('Password reset request', `Password reset is wired as a safe Supabase Auth workflow. No password is stored in the browser. Reset email requested for ${email}.`, 'Create reset audit record');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters for the local review gate.');
      return;
    }
    onAuth(email, role);
  };
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <button className="brand-button" onClick={() => navigate('/')}>
          <span className="brand-mark">D</span><span><strong>DHCM</strong><small>Finance Control Hub</small></span>
        </button>
        <h1>{title}</h1>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="finance@dhcm.example" /></label>
        {path !== '/forgot-password' ? <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" /></label> : null}
        {path !== '/forgot-password' ? (
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option>Admin</option>
              <option>Finance User</option>
              <option>Viewer</option>
            </select>
          </label>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        <div className="security-note"><KeyRound size={16} /> Passwords are not persisted in the frontend. Production password reset and MFA must run through Supabase Auth.</div>
        <button className="primary" onClick={submitAuth}>{title}</button>
        <div className="auth-links">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/signup')}>Signup</button>
          <button onClick={() => navigate('/forgot-password')}>Forgot password</button>
        </div>
      </section>
    </main>
  );
}

function ProtectedGate({ navigate, workflow }: { navigate: (path: string) => void; workflow: (title: string, body: string, action?: string) => void }) {
  return (
    <main className="auth-page">
      <section className="auth-panel protected-gate">
        <button className="brand-button" onClick={() => navigate('/')}>
          <span className="brand-mark">D</span><span><strong>DHCM</strong><small>Finance Control Hub</small></span>
        </button>
        <Lock size={34} />
        <h1>Protected finance workspace</h1>
        <p>Sign in to open the DHCM app. Until Supabase Auth is connected, login starts a local review session and records an audit event.</p>
        <button className="primary" onClick={() => navigate('/login')}>Sign in</button>
        <button className="secondary" onClick={() => workflow('Supabase Auth setup', requireSupabaseSetup('Protected routes').body, 'Show setup requirement')}>View setup requirement</button>
      </section>
    </main>
  );
}

function DashboardPage({ navigate, workflow, reviewableActions }: { navigate: (path: string) => void; workflow: (title: string, body: string, action?: string) => void; reviewableActions: AgentAction[] }) {
  const approvalQueue = [...reviewableActions, ...agentActions];
  const [selectedEntity, setSelectedEntity] = useState(entities[0].entity);
  const selectedEntityRow = entities.find((entity) => entity.entity === selectedEntity) || entities[0];
  return (
    <main className="page-grid">
      <section className="kpi-grid span-3">
        <MetricCard label="Total AR" value={formatAed(totalAr())} delta="+3.1%" />
        <MetricCard label="Overdue Balance" value={formatAed(totalOverdue())} delta="-1.8%" />
        <MetricCard label="Critical 90+" value={formatAed(sumBy('critical90'))} delta="+0.8%" warning />
        <MetricCard label="CEI" value="84.9%" delta="+2.2%" />
      </section>
      <section className="panel span-2">
        <PanelHead title="Executive AR Control" action="Open AR" onClick={() => navigate('/ar')} />
        <EntityBars />
      </section>
      <section className="panel">
        <PanelHead title="Pending agent approvals" action="Review" onClick={() => navigate('/app/agent')} />
        <ActionList actions={approvalQueue} workflow={workflow} />
      </section>
      <section className="panel">
        <PanelHead title="Portfolio mix" action="Open files" onClick={() => navigate('/app/files')} />
        <PortfolioDonut selectedEntity={selectedEntity} onSelect={setSelectedEntity} />
        <div className="chart-detail">
          <strong>{selectedEntityRow.entity}</strong>
          <span>{formatAed(selectedEntityRow.totalAr)} total AR</span>
          <span>{formatAed(selectedEntityRow.critical90)} 90+ exposure</span>
        </div>
      </section>
      <section className="panel span-2">
        <PanelHead title="Collections trend" action="Open reports" onClick={() => navigate('/app/reports')} />
        <TrendChart />
      </section>
      <section className="panel span-3">
        <PanelHead title="Customer risk queue" action="Create follow-up task" onClick={() => workflow('Follow-up task draft', 'A reviewable collections task will be created for selected high-risk customers.', 'Open task draft')} />
        <CustomerTable navigate={navigate} />
      </section>
    </main>
  );
}

function ArPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const [period, setPeriod] = useState('Q2 2025');
  const [entityFilter, setEntityFilter] = useState('All');
  const [displayMode, setDisplayMode] = useState('Amount');
  const visibleEntities = entityFilter === 'All' ? entities : entities.filter((entity) => entity.entity === entityFilter);
  return (
    <main className="page-grid">
      <section className="filter-bar span-3">
        {['Q1 2025', 'Q2 2025', 'YTD'].map((item) => <button key={item} className={item === period ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}
        {['All', 'DCM', 'DPCM', 'DPDM', 'NCM', 'NPCM'].map((item) => <button key={item} className={item === entityFilter ? 'active' : ''} onClick={() => setEntityFilter(item)}>{item}</button>)}
        {['Amount', 'Percent', 'DSO'].map((item) => <button key={item} className={item === displayMode ? 'active' : ''} onClick={() => setDisplayMode(item)}>{item}</button>)}
      </section>
      <section className="kpi-grid span-3">
        <MetricCard label="Total AR" value={formatAed(totalAr())} delta="+3.1%" />
        <MetricCard label="Current %" value="62.4%" delta="+1.4%" />
        <MetricCard label="Critical 180+" value={formatAed(sumBy('critical180'))} delta="+0.5%" warning />
        <MetricCard label="ECL Provision" value={formatAed(sumBy('eclProvision'))} delta="+2.9%" warning />
      </section>
      <section className="panel span-2"><PanelHead title={`Stacked aging by entity - ${period} - ${displayMode}`} action="Export view" onClick={() => workflow('AR view export', `The ${period} / ${entityFilter} / ${displayMode} AR filters will be captured as an export job for review.`, 'Create export job')} /><StackedAgingChart rows={visibleEntities} /></section>
      <section className="panel"><InsightPanel workflow={workflow} /></section>
      <section className="panel"><PanelHead title="90+ exposure trend" /><ExposureTrend /></section>
      <section className="panel"><PanelHead title="ECL provision by bucket" /><EclProvisionChart /></section>
      <section className="panel"><PanelHead title="Top overdue customers" /><TopCustomerChart /></section>
      <section className="panel span-3"><PanelHead title="90+ priority list" action="Draft collection actions" onClick={() => workflow('Collection action draft', 'The AI agent will draft actions for 90+ priority accounts and place them in the approval queue.', 'Draft actions')} /><CustomerTable /></section>
    </main>
  );
}

function CustomersPage({ navigate, workflow }: { navigate: (path: string) => void; workflow: (title: string, body: string, action?: string) => void }) {
  return (
    <main className="page-grid">
      <section className="panel span-3">
        <PanelHead title="Customer workspace" action="Upload document" onClick={() => workflow('Document upload', 'A document upload record will be created after Supabase Storage is configured.', 'Open upload modal')} />
        <CustomerTable navigate={navigate} />
      </section>
    </main>
  );
}

function CustomerWorkspace({ customerId, workflow, auditEvents }: { customerId: string; workflow: (title: string, body: string, action?: string) => void; auditEvents: AuditEvent[] }) {
  const customer = customers.find((item) => item.id === customerId) || customers[0];
  const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id);
  return (
    <main className="page-grid">
      <section className="customer-hero span-3">
        <div><span className="eyebrow">{customer.number} - {customer.entity}</span><h2>{customer.name}</h2><p>{customer.vertical} - Primary contact: {customer.primaryContact}</p></div>
        <RiskBadge score={customer.riskScore} />
      </section>
      <section className="kpi-grid span-3">
        <MetricCard label="Outstanding" value={formatAed(customer.totalOutstanding)} />
        <MetricCard label="90+ Days" value={formatAed(customer.amount90)} warning />
        <MetricCard label="180+ Days" value={formatAed(customer.amount180)} warning />
        <MetricCard label="Unapplied Receipts" value={formatAed(customer.unappliedReceipts)} />
      </section>
      <section className="quick-actions span-3">
        {['Generate SOA', 'Email SOA', 'Download SOA Excel', 'Record Partial Payment', 'Match Bank Receipt', 'Create Payment Plan', 'Draft Customer Reply', 'Escalate 90+ Account'].map((label) => (
          <button key={label} onClick={() => workflow(label, `${label} will open a reviewable workflow record for ${customer.name}. No external action is executed without approval.`, 'Open workflow')}>
            {label}
          </button>
        ))}
      </section>
      <section className="panel span-2"><PanelHead title="Invoice-level details" /><InvoiceTable rows={customerInvoices} /></section>
      <section className="panel"><PanelHead title="Audit and agent notes" /><ActivityList events={auditEvents} /></section>
    </main>
  );
}

function ImportsPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const result = importResults[0];
  return (
    <main className="page-grid">
      <section className="panel span-2">
        <PanelHead title="Oracle Fusion AR Aging import" action="Upload Excel" onClick={() => workflow('Oracle Excel upload', 'Select an Oracle AR Aging workbook. The system will validate required columns, bucket mapping, failed rows, and entity mapping before import approval.', 'Open upload modal')} />
        <div className="import-card">
          <FileSpreadsheet size={32} />
          <div><strong>{result.fileName}</strong><span>{result.validRows} valid rows - {result.failedRows} failed rows - {result.status}</span></div>
        </div>
        <ul className="issue-list">{result.notes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>
      <section className="panel">
        <PanelHead title="Required Oracle column contract" />
        <p className="muted-copy">{ORACLE_AR_REQUIRED_COLUMNS.length} required fields. {result.missingColumns.length} missing in latest seed validation.</p>
        <div className="sheet-grid">{result.missingColumns.map((column) => <span className="chip" key={column}>{column}</span>)}</div>
      </section>
      <section className="panel span-3">
        <PanelHead title="Aging bucket mapping" action="Create mapping review" onClick={() => workflow('Oracle aging bucket mapping', 'Creates a reviewable mapping record for Oracle aging bucket columns before imported rows are accepted.', 'Create mapping review')} />
        <div className="sheet-grid">{ORACLE_AGING_BUCKET_COLUMNS.map((column) => <span className="chip" key={column}>{column}</span>)}</div>
      </section>
    </main>
  );
}

function BankingPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  return (
    <main className="page-grid">
      <section className="panel span-3">
        <PanelHead title="Connected banking transactions" action="Import statement" onClick={() => workflow('Bank statement import', 'Upload CSV/XLSX bank statements. Matching will create review-required records before any reconciliation decision is executed.', 'Open import modal')} />
        <BankTable />
      </section>
    </main>
  );
}

function ReconciliationPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  return (
    <main className="page-grid">
      <section className="kpi-grid span-3">
        <MetricCard label="Matched" value="1,284" />
        <MetricCard label="Review Required" value="32" warning />
        <MetricCard label="Unapplied Receipts" value="AED 12.1M" warning />
        <MetricCard label="Accuracy" value="99.97%" />
      </section>
      <section className="panel span-3">
        <PanelHead title="Exception queue" action="Draft matching decisions" onClick={() => workflow('Reconciliation decision draft', 'The agent will propose payment allocation matches and queue them for approval.', 'Draft decisions')} />
        <BankTable />
      </section>
    </main>
  );
}

function AgentCommandCenter({ context, workflow, reviewableActions, auditEvents }: { context: AgentContext; workflow: (title: string, body: string, action?: string) => void; reviewableActions: AgentAction[]; auditEvents: AuditEvent[] }) {
  const approvalQueue = [...reviewableActions, ...agentActions];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'seed-user', role: 'user', content: 'Prioritize 90+ accounts and draft collection next actions.' },
    { id: 'seed-assistant', role: 'assistant', content: 'I found three high-risk accounts. I can draft collection actions, SOA follow-ups, and a manager summary for approval.' }
  ]);
  const [input, setInput] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('AR aging');
  const submitMessage = () => {
    const question = input.trim();
    if (!question) return;
    const answer = createAgentAnswer(question, selectedPrompt, context);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: question },
      { id: `assistant-${Date.now()}`, role: 'assistant', content: answer }
    ]);
    setInput('');
  };
  return (
    <main className="agent-command">
      <section className="agent-main">
        <div className="agent-orb"><Bot size={30} /></div>
        <h2>AI Finance Agent Command Center</h2>
        <p>Ask about AR aging, customer risk, Oracle imports, reconciliation exceptions, SOA, email drafts, exports, or audit activity. The agent drafts actions only; approval is required before execution.</p>
        <div className="agentic-board">
          {[
            ['Observe', 'Read page context, filters, selected customer, and seed/live finance data.'],
            ['Analyze', 'Prioritize AR exposure, reconciliation exceptions, failed imports, and email needs.'],
            ['Draft', 'Prepare SOA, reminders, matching proposals, report summaries, and audit notes.'],
            ['Approve', 'Wait for user approval before any backend function executes.']
          ].map(([title, body]) => <div key={title}><strong>{title}</strong><span>{body}</span></div>)}
        </div>
        <div className="agent-prompt-row">
          {['AR aging', 'Collections', 'Reconciliation', 'Oracle import', 'Email drafting', 'Audit'].map((prompt) => (
            <button key={prompt} className={prompt === selectedPrompt ? 'active' : ''} onClick={() => setSelectedPrompt(prompt)}>{prompt}</button>
          ))}
        </div>
        <div className="chat-card">
          <div className="chat-scroll">
            {messages.map((message) => <div key={message.id} className={`message ${message.role}`}>{message.content}</div>)}
          </div>
          <div className="chat-input">
            <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' ? submitMessage() : undefined} placeholder="Ask the finance agent about AR, SOA, reconciliation, imports, or email drafts" />
            <button className="primary" onClick={submitMessage}><Send size={16} /> Send</button>
          </div>
          <button className="secondary" onClick={() => workflow('AI collection recommendation', 'Creates finance.agent_actions records with pending approval status. No email, legal status, payment status, or external system action is executed.', 'Create approval records')}>Create reviewable action from chat</button>
        </div>
      </section>
      <aside className="agent-side">
        <ContextCard context={context} />
        <section className="context-card"><h3>Reasoning summary</h3><p className="muted-copy">Grounded in DHCM seed AR, invoice, customer, banking, import, and audit data. Backend OpenAI calls must use Supabase Edge Functions only.</p></section>
        <ActionList actions={approvalQueue} workflow={workflow} />
        <ActivityList events={auditEvents} />
      </aside>
    </main>
  );
}

function ExportsPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const sheets = ['Cover Sheet', 'Executive Summary', 'Entity Aging Summary', 'Customer 90+ Priority List', 'Invoice Level Details', 'Unapplied Receipts', 'Reconciliation Exceptions', 'Dispute Summary', 'Audit Metadata'];
  return (
    <main className="page-grid">
      <section className="panel span-3">
        <PanelHead title="Finance-standard Excel export center" action="Generate workbook" onClick={() => workflow('Excel export job', 'Creates an export job for Supabase Edge Function processing with reviewed filters, prepared-by user, timestamps, and audit metadata.', 'Create export job')} />
        <div className="sheet-grid">{sheets.map((sheet) => <span className="chip" key={sheet}>{sheet}</span>)}</div>
      </section>
    </main>
  );
}

function FileManagerPage({ navigate, workflow }: { navigate: (path: string) => void; workflow: (title: string, body: string, action?: string) => void }) {
  const files = [
    { name: 'Nakheel_SOA_May_2025.xlsx', owner: 'Nakheel Communities', type: 'SOA Excel', status: 'Draft', route: '/app/customers/cust-nakheel' },
    { name: 'Oracle_AR_Aging_May_2025.xlsx', owner: 'Oracle Fusion Import', type: 'Import Validation', status: 'Review required', route: '/app/imports' },
    { name: 'Emaar_VAT_Reconciliation.pdf', owner: 'Emaar Properties PJSC', type: 'VAT Reconciliation', status: 'Attached', route: '/app/customers/cust-emaar' },
    { name: 'Bank_Reconciliation_Exceptions.xlsx', owner: 'Treasury', type: 'Reconciliation', status: 'Pending approval', route: '/app/reconciliation' }
  ];
  return (
    <main className="page-grid">
      <section className="panel span-3">
        <PanelHead title="Finance file manager" action="Upload document" onClick={() => workflow('Document upload', 'Upload opens a Supabase Storage workflow. Files are permission-scoped and virus scanning must run before production sharing.', 'Create upload record')} />
        <div className="file-grid">
          {files.map((file) => (
            <article key={file.name} className="file-card">
              <FolderOpen size={24} />
              <div>
                <strong>{file.name}</strong>
                <span>{file.owner} - {file.type}</span>
                <em>{file.status}</em>
              </div>
              <div className="file-actions">
                <button onClick={() => navigate(file.route)}>Open workspace</button>
                <button onClick={() => workflow('Download file', `${file.name} download will be generated through a permission-scoped backend export/storage URL.`, 'Create download record')}>Download</button>
                <button onClick={() => workflow('Email attachment', `${file.name} will be attached to a draft email only after approval.`, 'Draft email')}>Email</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ReportsPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const reports = ['AR Aging Report', '90+ Collection Report', '180+ Critical Report', 'ECL Provision Report', 'Customer Risk Report', 'SOA Sent Report', 'Promise-to-Pay Report', 'Dispute Report', 'Unapplied Receipts Report', 'Reconciliation Report', 'Oracle Sync Report', 'Agent Action Report'];
  return <main className="page-grid"><section className="panel span-3"><PanelHead title="Reports" /> <div className="report-grid">{reports.map((report) => <button key={report} onClick={() => workflow(report, `${report} will open report parameters and create a reviewable report job.`, 'Configure report')}>{report}</button>)}</div></section></main>;
}

function EmailsPage({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const templates = ['SOA Follow-up', 'Payment Reminder', 'Final Reminder', 'Receipt Confirmation', 'Dispute Clarification', 'Payment Plan Confirmation', 'Legal Escalation Notice', 'Thank You for Payment', 'Missing Payment Reference Request'];
  const [template, setTemplate] = useState(templates[0]);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const selectedCustomer = customers.find((customer) => customer.id === customerId) || customers[0];
  const [subject, setSubject] = useState(`${template} - ${selectedCustomer.name}`);
  const [body, setBody] = useState(createEmailDraft(template, selectedCustomer.name));
  const updateDraft = (nextTemplate: string, nextCustomerId = customerId) => {
    const nextCustomer = customers.find((customer) => customer.id === nextCustomerId) || customers[0];
    setTemplate(nextTemplate);
    setCustomerId(nextCustomerId);
    setSubject(`${nextTemplate} - ${nextCustomer.name}`);
    setBody(createEmailDraft(nextTemplate, nextCustomer.name));
  };
  return (
    <main className="page-grid">
      <section className="panel">
        <PanelHead title="Template chooser" />
        <div className="template-list">{templates.map((item) => <button key={item} className={item === template ? 'active' : ''} onClick={() => updateDraft(item)}>{item}</button>)}</div>
      </section>
      <section className="panel span-2">
        <PanelHead title="Draft editor" action="Queue for approval" onClick={() => workflow('Email draft approval', `Email draft queued for ${selectedCustomer.name}. Subject: ${subject}. Sending requires approved backend email-send-approved execution.`, 'Create approval record')} />
        <div className="email-editor">
          <label>Customer<select value={customerId} onChange={(event) => updateDraft(template, event.target.value)}>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></label>
          <label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
          <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} /></label>
          <div className="modal-actions">
            <button className="secondary" onClick={() => workflow('Save email draft', `Draft saved locally for review. Customer: ${selectedCustomer.name}.`, 'Save draft record')}>Save draft</button>
            <button className="primary" onClick={() => workflow('Send email after approval', `This will only send through the backend email Edge Function after approval. Recipient: ${selectedCustomer.email}.`, 'Create send approval')}><Send size={16} /> Send after approval</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SettingsPage({ path, workflow }: { path: string; workflow: (title: string, body: string, action?: string) => void }) {
  const tools = ['Supabase', 'OpenAI', 'Oracle Fusion', 'Zoho MCP', 'Gmail/SMTP', 'Google Drive', 'Google Sheets', 'GitHub', 'Lovable', 'Connected Banking', 'MCP Server Framework'];
  return (
    <main className="page-grid">
      <section className="panel span-3">
        <PanelHead title={path === '/app/admin/diagnostics' ? 'Admin diagnostics' : path === '/app/mcp-tools' ? 'MCP tools' : 'Settings'} />
        <div className="integration-grid">
          {tools.map((tool) => <button key={tool} onClick={() => workflow(`${tool} connection test`, `${tool} requires environment variables and reviewed credentials before live actions are enabled.`, 'Show setup requirement')}><strong>{tool}</strong><span>Setup required</span></button>)}
        </div>
      </section>
    </main>
  );
}

function AuditPage({ auditEvents }: { auditEvents: AuditEvent[] }) {
  return <main className="page-grid"><section className="panel span-3"><PanelHead title="Audit trail" /><ActivityList events={auditEvents} /></section></main>;
}

function FloatingAgent({ context, workflow }: { context: AgentContext; workflow: (title: string, body: string, action?: string) => void }) {
  return (
    <aside className="floating-agent">
      <div className="agent-header"><Bot size={18} /><strong>Finance Agent</strong><span>{context.title}</span></div>
      <p>I can analyze this page context and draft reviewable actions.</p>
      <button onClick={() => workflow('AI agent draft', `Context captured for ${context.title}. The backend ai-chat Edge Function will store the question, context snapshot, response, and proposed action.`, 'Open draft preview')}>Ask agent</button>
    </aside>
  );
}

function WorkflowModal({ modal, onClose, onConfirm }: { modal: ModalState; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <h2>{modal.title}</h2>
        <p>{modal.body}</p>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={onConfirm}>{modal.action || 'Create draft'}</button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, delta, warning }: { label: string; value: string; delta?: string; warning?: boolean }) {
  return <article className={`metric ${warning ? 'warning' : ''}`}><span>{label}</span><strong>{value}</strong>{delta ? <em>{delta}</em> : null}</article>;
}

function PanelHead({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return <div className="panel-head"><h2>{title}</h2>{action ? <button onClick={onClick}>{action}</button> : null}</div>;
}

function EntityBars() {
  const max = Math.max(...entities.map((entity) => entity.totalAr));
  return <div className="bars">{entities.map((entity) => <div key={entity.entity} className="bar-row"><span>{entity.entity}</span><div><i style={{ width: `${(entity.totalAr / max) * 100}%` }} /></div><strong>{formatAed(entity.totalAr)}</strong></div>)}</div>;
}

function MiniAgingChart() {
  return <div className="mini-chart">{entities.map((entity) => <span key={entity.entity} style={{ height: `${Math.max(18, entity.dso)}%` }} title={entity.entity} />)}</div>;
}

function StackedAgingChart({ rows }: { rows: EntityAging[] }) {
  return (
    <div className="stacked-chart">
      {rows.map((entity) => {
        const current = (entity.current / entity.totalAr) * 100;
        const overdue = (entity.overdue / entity.totalAr) * 100;
        const critical = (entity.critical90 / entity.totalAr) * 100;
        return (
          <div className="stacked-row" key={entity.entity}>
            <span>{entity.entity}</span>
            <div className="stacked-track">
              <i className="seg current" style={{ width: `${current}%` }} />
              <i className="seg overdue" style={{ width: `${overdue}%` }} />
              <i className="seg critical" style={{ width: `${critical}%` }} />
            </div>
            <strong>{formatAed(entity.totalAr)}</strong>
          </div>
        );
      })}
      <div className="legend"><span className="current" /> Current <span className="overdue" /> Overdue <span className="critical" /> 90+</div>
    </div>
  );
}

function PortfolioDonut({ selectedEntity, onSelect }: { selectedEntity: string; onSelect: (entity: string) => void }) {
  const total = totalAr();
  let cursor = 0;
  const stops = entities.map((entity, index) => {
    const start = cursor;
    const end = cursor + (entity.totalAr / total) * 100;
    cursor = end;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  }).join(', ');
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}><span>{formatAed(total)}</span></div>
      <div className="donut-list">{entities.map((entity, index) => (
        <button className={entity.entity === selectedEntity ? 'active' : ''} key={entity.entity} onClick={() => onSelect(entity.entity)}>
          <i style={{ background: chartColors[index % chartColors.length] }} />{entity.entity} {Math.round((entity.totalAr / total) * 100)}%
        </button>
      ))}</div>
    </div>
  );
}

function TrendChart() {
  const points = [68, 74, 79, 84, 91, 88, 96];
  return <div className="trend-chart">{points.map((point, index) => <span key={index} style={{ height: `${point}%` }}><em>{point}%</em></span>)}</div>;
}

function ExposureTrend() {
  const points = entities.map((entity) => Math.round(entity.critical90 / 1_000_000));
  const max = Math.max(...points);
  return <div className="sparkline">{points.map((point, index) => <span key={index} style={{ height: `${Math.max(12, (point / max) * 100)}%` }}><em>{entities[index].entity}</em></span>)}</div>;
}

function EclProvisionChart() {
  const max = Math.max(...entities.map((entity) => entity.eclProvision));
  return <div className="ecl-chart">{entities.map((entity) => <div key={entity.entity}><span>{entity.entity}</span><i style={{ width: `${(entity.eclProvision / max) * 100}%` }} /><strong>{formatAed(entity.eclProvision)}</strong></div>)}</div>;
}

function TopCustomerChart() {
  const max = Math.max(...customers.map((customer) => customer.overdueAmount));
  return <div className="ecl-chart">{customers.map((customer) => <div key={customer.id}><span>{customer.name}</span><i style={{ width: `${(customer.overdueAmount / max) * 100}%` }} /><strong>{formatAed(customer.overdueAmount)}</strong></div>)}</div>;
}

function CustomerTable({ navigate }: { navigate?: (path: string) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Customer</th><th>Entity</th><th>Outstanding</th><th>90+</th><th>180+</th><th>Risk</th></tr></thead>
        <tbody>{customers.map((customer) => <tr key={customer.id} onClick={() => navigate?.(`/app/customers/${customer.id}`)}><td>{customer.name}<span>{customer.number}</span></td><td>{customer.entity}</td><td>{formatAed(customer.totalOutstanding)}</td><td>{formatAed(customer.amount90)}</td><td>{formatAed(customer.amount180)}</td><td><RiskBadge score={customer.riskScore} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

function InvoiceTable({ rows }: { rows: typeof invoices }) {
  return <div className="table-wrap"><table><thead><tr><th>Invoice</th><th>Due</th><th>Days Late</th><th>Bucket</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.transactionNumber}</td><td>{row.dueDate}</td><td>{row.daysLate}</td><td>{row.bucket}</td><td>{formatAed(row.amountDue)}</td><td>{row.status}</td></tr>)}</tbody></table></div>;
}

function BankTable() {
  return <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Account</th><th>Customer Hint</th><th>Amount</th><th>Status</th><th>Confidence</th></tr></thead><tbody>{bankTransactions.map((row) => <tr key={row.id}><td>{row.reference}</td><td>{row.bankAccount}</td><td>{row.customerHint}</td><td>{formatAed(row.amount)}</td><td>{row.status}</td><td>{row.confidence}%</td></tr>)}</tbody></table></div>;
}

function RiskBadge({ score }: { score: number }) {
  return <span className={`risk ${score >= 80 ? 'high' : 'medium'}`}>{score}</span>;
}

function InsightPanel({ workflow }: { workflow: (title: string, body: string, action?: string) => void }) {
  const topRisk = entities.reduce((a, b) => (a.critical90 > b.critical90 ? a : b));
  return <div className="insights"><h2>Right insight panel</h2><p><strong>Portfolio Status:</strong> Watchlist, with controlled CEI improvement.</p><p><strong>Top Risk Entity:</strong> {topRisk.entity}</p><p><strong>Provision Rate:</strong> 1.9% estimated seed baseline.</p><button className="primary" onClick={() => workflow('AI recommended action', 'Draft a manager-ready recommendation for high-risk 90+ accounts. Approval is required before any task or email is executed.', 'Draft recommendation')}>AI recommended action</button></div>;
}

function ActionList({ actions, workflow }: { actions: AgentAction[]; workflow: (title: string, body: string, action?: string) => void }) {
  return <div className="action-list">{actions.map((action) => <button key={action.id} onClick={() => workflow(action.title, `${action.description} Status: ${action.status}.`, 'Review approval')}><CheckCircle2 size={16} /><span><strong>{action.title}</strong><em>{action.status}</em></span></button>)}</div>;
}

function ActivityList({ events = [] }: { events?: AuditEvent[] }) {
  const seedItems = [
    'Login recorded for Finance User',
    'Oracle import validation completed',
    'SOA draft created for Nakheel Communities',
    'Agent recommendation queued for approval',
    'Bank transaction match override awaiting approval'
  ];
  const items = [
    ...events.map((event) => `${event.action}: ${event.details}`),
    ...seedItems
  ];
  return <ul className="activity-list">{items.map((item) => <li key={item}><span />{item}</li>)}</ul>;
}

function ContextCard({ context }: { context: AgentContext }) {
  return <section className="context-card"><h3>Context snapshot</h3>{Object.entries(context).map(([key, value]) => value ? <span className="chip" key={key}>{key}: {Array.isArray(value) ? value.join(', ') : value}</span> : null)}</section>;
}

function titleForPath(path: string) {
  if (path === '/ar') return 'DHCM AR Control';
  if (path.startsWith('/app/customers/')) return 'Customer Account Workspace';
  const route = appRoutes.find(([, routePath]) => routePath === path);
  return route?.[0] || 'DHCM Finance Control Hub';
}

function totalAr() {
  return entities.reduce((sum, entity) => sum + entity.totalAr, 0);
}

function totalOverdue() {
  return entities.reduce((sum, entity) => sum + entity.overdue, 0);
}

function sumBy(key: keyof Pick<EntityAging, 'critical90' | 'critical180' | 'eclProvision'>) {
  return entities.reduce((sum, entity) => sum + entity[key], 0);
}

function createAgentAnswer(question: string, mode: string, context: AgentContext) {
  const topCustomer = customers.reduce((a, b) => (a.amount90 > b.amount90 ? a : b));
  const topEntity = entities.reduce((a, b) => (a.critical90 > b.critical90 ? a : b));
  const prefix = `${mode} analysis for ${context.title}:`;
  if (/email|soa|reminder|draft/i.test(question)) {
    return `${prefix} I can draft an SOA/payment reminder for ${topCustomer.name}. The draft will stay in pending approval and will not send until the email Edge Function receives an approved action record.`;
  }
  if (/reconcile|bank|match|receipt|payment/i.test(question)) {
    return `${prefix} ${bankTransactions.length} seed bank transactions are available. Highest-confidence review item is ${bankTransactions[0].reference} at ${bankTransactions[0].confidence}%. I recommend creating a review-required allocation proposal, not posting it automatically.`;
  }
  if (/oracle|import|column|bucket|file/i.test(question)) {
    return `${prefix} Latest Oracle import has ${importResults[0].failedRows} failed rows and missing columns: ${importResults[0].missingColumns.join(', ')}. Next step is a mapping review and failed-row export.`;
  }
  if (/dso|cei|ecl|provision|aging|90|180|risk/i.test(question)) {
    return `${prefix} Total AR is ${formatAed(totalAr())}, overdue is ${formatAed(totalOverdue())}, 90+ exposure is ${formatAed(sumBy('critical90'))}, and top risk entity is ${topEntity.entity}. Prioritize ${topCustomer.name} for SOA and collection follow-up.`;
  }
  return `${prefix} I can answer from DHCM seed data, draft an action, create an approval record, and log the audit trail. I will not send emails, change legal/payment status, overwrite imports, or trigger external systems without approval.`;
}

function createEmailDraft(template: string, customerName: string) {
  return `Dear ${customerName} Accounts Payable Team,\n\nPlease find the ${template.toLowerCase()} prepared for review. Kindly confirm the expected payment allocation, any disputed invoice references, and the committed payment date.\n\nThis message is currently a draft. It will only be sent after finance approval and backend email configuration.\n\nRegards,\nDHCM Finance Control Hub`;
}

function loadReviewableActions() {
  return loadJson<AgentAction[]>('dhcm.reviewableActions', []);
}

function loadAuditEvents() {
  return loadJson<AuditEvent[]>('dhcm.auditEvents', []);
}

function loadUserSession() {
  return loadJson<UserSession | null>('dhcm.userSession', null);
}

function loadJson<T>(key: string, fallback: T) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function inferRisk(title: string): AgentAction['riskLevel'] {
  if (/legal|payment status|overwrite|external|bank|reconciliation/i.test(title)) return 'high';
  if (/email|soa|collection|export|oracle|import/i.test(title)) return 'medium';
  return 'low';
}
