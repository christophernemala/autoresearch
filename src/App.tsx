import { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Banknote,
  Bot,
  BrainCircuit,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  Link2,
  Palette,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  WalletCards
} from 'lucide-react';

type ThemeName = 'Executive Dark' | 'Gold Control' | 'Teal Ops';
type MatchStatus = 'Matched' | 'Probable Match' | 'Partial Match' | 'Unapplied' | 'Review Required' | 'Duplicate';
type AgentMode = 'Headless' | 'Interactive';

type Invoice = {
  invoiceNo: string;
  transactionNo: string;
  transactionDescription: string;
  customerName: string;
  customerNo: string;
  businessUnit: string;
  companyName: string;
  accountType: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  appliedAmount: number;
  amountDue: number;
  currency: string;
  bucket: string;
  slaStatus: string;
};

type BankTxn = {
  id: string;
  txnNo: string;
  date: string;
  valueDate: string;
  narration: string;
  description: string;
  payerName: string;
  amount: number;
  appliedAmount: number;
  unappliedAmount: number;
  currency: string;
  accountType: string;
  bankAccount: string;
  companyName: string;
  matchedInvoice?: string;
  matchedCustomer?: string;
  confidence: number;
  status: MatchStatus;
  reason: string;
};

type AgentConfig = {
  name: string;
  mode: AgentMode;
  model: string;
  mcp: string[];
  trigger: string;
  purpose: string;
  status: 'Ready' | 'Needs API Key' | 'Demo Only' | 'Paused';
};

const themes: Record<ThemeName, string> = {
  'Executive Dark': 'theme-dark',
  'Gold Control': 'theme-gold',
  'Teal Ops': 'theme-teal'
};

const agingBuckets = ['Current', '1-30', '31-60', '61-90', '91-180', '181-360', '361+'];

const invoices: Invoice[] = [
  {
    invoiceNo: 'INV-256010013000499',
    transactionNo: 'TRX-499',
    transactionDescription: 'Bund Wall recharge - Limitless Technopark',
    customerName: 'Limitless LLC',
    customerNo: 'CUST-1001',
    businessUnit: 'DHCM Finance',
    companyName: 'Dubai Holding Community Management',
    accountType: 'Trade Receivables',
    invoiceDate: '2026-06-01',
    dueDate: '2026-06-10',
    originalAmount: 460320,
    appliedAmount: 260320,
    amountDue: 200000,
    currency: 'AED',
    bucket: '1-30',
    slaStatus: 'Invoice SLA active - supportings uploaded'
  },
  {
    invoiceNo: 'INV-236010013000010',
    transactionNo: 'TRX-010',
    transactionDescription: 'Management fees 2020-2022 Site A DIC/DMC/DKP',
    customerName: 'TECOM Group',
    customerNo: 'CUST-1010',
    businessUnit: 'Community Management',
    companyName: 'DHCM Corporate',
    accountType: 'Trade Receivables',
    invoiceDate: '2024-12-31',
    dueDate: '2025-01-30',
    originalAmount: 1666350,
    appliedAmount: 0,
    amountDue: 1666350,
    currency: 'AED',
    bucket: '361+',
    slaStatus: 'SLA review pending COE confirmation'
  },
  {
    invoiceNo: 'INV-22814',
    transactionNo: 'TRX-22814',
    transactionDescription: 'Coaching fees and community facility charges',
    customerName: 'Super Sports Academy',
    customerNo: 'CUST-1077',
    businessUnit: 'Community Operations',
    companyName: 'Community Corp LLC',
    accountType: 'Trade Receivables',
    invoiceDate: '2026-04-20',
    dueDate: '2026-05-20',
    originalAmount: 401074.8,
    appliedAmount: 362505.95,
    amountDue: 38568.85,
    currency: 'AED',
    bucket: '1-30',
    slaStatus: 'Partial paid - knock-off required'
  },
  {
    invoiceNo: 'INV-256020013000783',
    transactionNo: 'TRX-783',
    transactionDescription: 'Palm Jumeirah Boardwalk data migration NBV',
    customerName: 'Community Corp Opening Balance',
    customerNo: 'CUST-OB01',
    businessUnit: 'Data Migration',
    companyName: 'Community Corp LLC',
    accountType: 'Opening Balance - Excluded from DSO',
    invoiceDate: '2023-12-31',
    dueDate: '2024-01-31',
    originalAmount: 101913510.75,
    appliedAmount: 0,
    amountDue: 101913510.75,
    currency: 'AED',
    bucket: '361+',
    slaStatus: 'Excluded until vertical approval'
  },
  {
    invoiceNo: 'INV-MEY-2026-273211',
    transactionNo: 'TRX-MEY-26',
    transactionDescription: 'Management fee and service charge reconciliation',
    customerName: 'Meydan Group',
    customerNo: 'CUST-1112',
    businessUnit: 'Asset Management',
    companyName: 'NCM',
    accountType: 'Trade Receivables',
    invoiceDate: '2026-05-12',
    dueDate: '2026-06-11',
    originalAmount: 273211.23,
    appliedAmount: 0,
    amountDue: 273211.23,
    currency: 'AED',
    bucket: 'Current',
    slaStatus: 'Awaiting customer SOA confirmation'
  }
];

const rawBankTransactions: Omit<BankTxn, 'matchedInvoice' | 'matchedCustomer' | 'confidence' | 'status' | 'reason' | 'appliedAmount' | 'unappliedAmount'>[] = [
  {
    id: 'bank-001',
    txnNo: 'BNK-20260613-001',
    date: '2026-06-13',
    valueDate: '2026-06-13',
    narration: 'LIMITLESS INV-256010013000499 PART PAYMENT BUND WALL',
    description: 'Customer paid amount received by bank transfer',
    payerName: 'Limitless LLC',
    amount: 200000,
    currency: 'AED',
    accountType: 'Collection Bank',
    bankAccount: 'ENBD AED Collection 001',
    companyName: 'Dubai Holding Community Management'
  },
  {
    id: 'bank-002',
    txnNo: 'BNK-20260613-002',
    date: '2026-06-13',
    valueDate: '2026-06-13',
    narration: 'SUPER SPORTS ACADEMY PAYMENT AGAINST 22814',
    description: 'Partial customer payment matched by transaction number',
    payerName: 'Super Sports Academy',
    amount: 38568.85,
    currency: 'AED',
    accountType: 'Collection Bank',
    bankAccount: 'Mashreq AED Collection 004',
    companyName: 'Community Corp LLC'
  },
  {
    id: 'bank-003',
    txnNo: 'BNK-20260613-003',
    date: '2026-06-13',
    valueDate: '2026-06-13',
    narration: 'TECOM GROUP ADVANCE PAYMENT SITE A',
    description: 'Narration has customer name but no invoice number',
    payerName: 'TECOM Group',
    amount: 500000,
    currency: 'AED',
    accountType: 'Collection Bank',
    bankAccount: 'ENBD AED Collection 001',
    companyName: 'DHCM Corporate'
  },
  {
    id: 'bank-004',
    txnNo: 'BNK-20260613-004',
    date: '2026-06-13',
    valueDate: '2026-06-13',
    narration: 'UNKNOWN TRANSFER PMT 273211.23',
    description: 'Amount-only match, needs review before knock-off',
    payerName: 'Unknown',
    amount: 273211.23,
    currency: 'AED',
    accountType: 'Collection Bank',
    bankAccount: 'ADCB AED Collection 002',
    companyName: 'NCM'
  }
];

const agents: AgentConfig[] = [
  { name: 'BI Report Generator', mode: 'Headless', model: 'claude-sonnet-4-6', mcp: ['supabase', 'slack'], trigger: 'Monday 07:00 UTC', purpose: 'Runs canned SQL, creates BI narrative and posts Slack recap.', status: 'Needs API Key' },
  { name: 'Tax Prep Assistant', mode: 'Interactive', model: 'claude-sonnet-4-6', mcp: ['stripe', 'brex', 'quickbooks'], trigger: 'Chat', purpose: 'Categorizes transactions and flags deductible items.', status: 'Demo Only' },
  { name: 'Plaid Cashflow Analyst', mode: 'Interactive', model: 'claude-sonnet-4-6', mcp: ['plaid'], trigger: 'Chat or daily bank pull', purpose: 'Reads bank balances and extracts customer paid amount from daily bank statement.', status: 'Needs API Key' },
  { name: 'Metabase Question Builder', mode: 'Interactive', model: 'claude-sonnet-4-6', mcp: ['metabase'], trigger: 'Chat approval', purpose: 'Converts natural language into SQL cards and chart suggestions.', status: 'Demo Only' },
  { name: 'Mercury Reconciler', mode: 'Headless', model: 'claude-sonnet-4-6', mcp: ['mercury', 'xero'], trigger: 'Daily 06:00 UTC', purpose: 'Matches bank transactions to invoices and flags mismatches.', status: 'Demo Only' },
  { name: 'Productboard Insight Miner', mode: 'Headless', model: 'claude-sonnet-4-6', mcp: ['productboard'], trigger: 'Monday 08:00 UTC', purpose: 'Mines product insights and creates weekly PM brief.', status: 'Paused' },
  { name: 'Canny Feedback Clusterer', mode: 'Headless', model: 'claude-sonnet-4-6', mcp: ['canny', 'linear'], trigger: 'Every 6 hours', purpose: 'Clusters feedback and creates high-signal Linear issues.', status: 'Paused' },
  { name: 'Airtable / Sheets Agent', mode: 'Interactive', model: 'claude-sonnet-4-6', mcp: ['airtable', 'google-sheets'], trigger: 'Chat confirmation', purpose: 'Reads, updates and syncs Airtable and Google Sheets rows.', status: 'Needs API Key' },
  { name: 'Data Analyst', mode: 'Interactive', model: 'claude-sonnet-4-6', mcp: ['amplitude'], trigger: 'Chat/file', purpose: 'Loads datasets, builds charts and explains findings.', status: 'Demo Only' }
];

function money(value: number) {
  return `AED ${value.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function clean(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function bucketAmount(bucket: string) {
  return invoices.filter((i) => i.bucket === bucket).reduce((sum, i) => sum + i.amountDue, 0);
}

function matchTransactions(): BankTxn[] {
  const seen = new Set<string>();
  return rawBankTransactions.map((txn) => {
    const narration = clean(`${txn.narration} ${txn.description} ${txn.payerName}`);
    const candidates = invoices.map((invoice) => {
      let score = 0;
      const reasons: string[] = [];
      if (narration.includes(clean(invoice.invoiceNo)) || narration.includes(clean(invoice.transactionNo))) {
        score += 55;
        reasons.push('invoice/transaction number matched');
      }
      if (Math.abs(txn.amount - invoice.amountDue) <= 0.01) {
        score += 30;
        reasons.push('amount matched open balance');
      } else if (txn.amount < invoice.amountDue && txn.amount > 0) {
        score += 14;
        reasons.push('partial amount against open invoice');
      }
      if (narration.includes(clean(invoice.customerName))) {
        score += 25;
        reasons.push('customer name found in narration');
      }
      if (txn.companyName === invoice.companyName) {
        score += 8;
        reasons.push('company matched');
      }
      return { invoice, score, reason: reasons.join(', ') || 'weak amount/date similarity only' };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const duplicateKey = `${txn.amount}-${txn.date}-${best?.invoice.invoiceNo}`;
    const duplicate = seen.has(duplicateKey);
    seen.add(duplicateKey);
    const confidence = Math.min(best?.score || 0, 99);
    let status: MatchStatus = 'Review Required';
    if (duplicate) status = 'Duplicate';
    else if (confidence >= 80 && txn.amount >= best.invoice.amountDue) status = 'Matched';
    else if (confidence >= 70) status = 'Partial Match';
    else if (confidence >= 45) status = 'Probable Match';
    else status = 'Unapplied';

    const appliedAmount = status === 'Matched' || status === 'Partial Match' || status === 'Probable Match' ? Math.min(txn.amount, best.invoice.amountDue) : 0;
    return {
      ...txn,
      matchedInvoice: confidence >= 45 ? best.invoice.invoiceNo : undefined,
      matchedCustomer: confidence >= 45 ? best.invoice.customerName : undefined,
      confidence,
      status,
      reason: best?.reason || 'no matching rule fired',
      appliedAmount,
      unappliedAmount: Math.max(txn.amount - appliedAmount, 0)
    };
  });
}

export function App() {
  const [page, setPage] = useState('Dashboard');
  const [theme, setTheme] = useState<ThemeName>('Executive Dark');
  const [selectedAgent, setSelectedAgent] = useState(agents[0].name);
  const [apiProvider, setApiProvider] = useState('Anthropic Managed Agents');
  const [model, setModel] = useState('claude-sonnet-4-6');
  const [approvalLog, setApprovalLog] = useState<string[]>(['System restored from safe baseline', 'Demo finance logic loaded']);
  const matchedTxns = useMemo(matchTransactions, []);
  const activeAgent = agents.find((a) => a.name === selectedAgent) || agents[0];
  const paidToday = matchedTxns.reduce((s, t) => s + t.amount, 0);
  const appliedToday = matchedTxns.reduce((s, t) => s + t.appliedAmount, 0);
  const unappliedToday = matchedTxns.reduce((s, t) => s + t.unappliedAmount, 0);
  const totalAr = invoices.reduce((s, i) => s + i.amountDue, 0);
  const matchRate = Math.round((matchedTxns.filter((t) => ['Matched', 'Partial Match', 'Probable Match'].includes(t.status)).length / matchedTxns.length) * 100);

  function approve(txn: BankTxn) {
    setApprovalLog((log) => [`Approved knock-off: ${txn.txnNo} -> ${txn.matchedInvoice || 'unapplied'} for ${money(txn.appliedAmount)}`, ...log]);
  }

  const nav = ['Dashboard', 'Transactions', 'Invoices', 'Bank Reconciliation', 'Invoice SLA Upload', 'Agents', 'API & Auth', 'Audit'];

  return (
    <div className={`app-shell ${themes[theme]}`}>
      <aside className="sidebar">
        <div className="brand"><span>DH</span><div><strong>DHCM Finance</strong><small>Agent Command Center</small></div></div>
        <nav>{nav.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>{iconFor(item)}{item}</button>)}</nav>
        <div className="side-card"><small>Model</small><strong>{model}</strong><p>Demo runtime. Add API key in Vercel/Supabase secrets to authenticate real agents.</p></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><small>Production Vite app • Vercel • Supabase-ready</small><h1>{page}</h1></div>
          <div className="top-actions">
            <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}>{Object.keys(themes).map((t) => <option key={t}>{t}</option>)}</select>
            <button onClick={() => setPage('API & Auth')}><KeyRound size={16} /> API Keys</button>
            <button onClick={() => setPage('Agents')}><Bot size={16} /> Agents</button>
          </div>
        </header>

        {page === 'Dashboard' && <Dashboard totalAr={totalAr} paidToday={paidToday} appliedToday={appliedToday} unappliedToday={unappliedToday} matchRate={matchRate} matchedTxns={matchedTxns} setPage={setPage} />}
        {page === 'Transactions' && <Transactions matchedTxns={matchedTxns} approve={approve} />}
        {page === 'Invoices' && <Invoices />}
        {page === 'Bank Reconciliation' && <Reconciliation matchedTxns={matchedTxns} approve={approve} />}
        {page === 'Invoice SLA Upload' && <SlaUpload />}
        {page === 'Agents' && <Agents activeAgent={activeAgent} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} setPage={setPage} />}
        {page === 'API & Auth' && <ApiAuth apiProvider={apiProvider} setApiProvider={setApiProvider} model={model} setModel={setModel} />}
        {page === 'Audit' && <Audit approvalLog={approvalLog} />}
      </main>
    </div>
  );
}

function Dashboard({ totalAr, paidToday, appliedToday, unappliedToday, matchRate, matchedTxns, setPage }: { totalAr: number; paidToday: number; appliedToday: number; unappliedToday: number; matchRate: number; matchedTxns: BankTxn[]; setPage: (p: string) => void }) {
  return <section className="stack">
    <div className="hero-panel"><div><small>21st.dev-style finance agent workspace</small><h2>Daily O2C control, customer payment extraction and AI-assisted reconciliation.</h2><p>All demo data is visible and auditable: transaction number, customer, description, BU, invoice, account type, company, 7 aging buckets, applied and unapplied amount.</p></div><button onClick={() => setPage('Bank Reconciliation')}>Start knock-off review <ChevronRight size={18} /></button></div>
    <div className="kpis">
      <Metric label="Total AR" value={money(totalAr)} icon={<CircleDollarSign />} />
      <Metric label="Customer paid today" value={money(paidToday)} icon={<Banknote />} />
      <Metric label="Applied today" value={money(appliedToday)} icon={<BadgeCheck />} />
      <Metric label="Unapplied amount" value={money(unappliedToday)} icon={<WalletCards />} warn />
      <Metric label="Auto match rate" value={`${matchRate}%`} icon={<Link2 />} />
    </div>
    <div className="grid two">
      <Panel title="7 Aging Buckets" action="Trade receivables only">
        <div className="bucket-grid">{agingBuckets.map((b) => <div key={b}><small>{b}</small><strong>{money(bucketAmount(b))}</strong><span style={{ width: `${Math.min(100, bucketAmount(b) / 1100000)}%` }} /></div>)}</div>
      </Panel>
      <Panel title="Today’s Payment Matching Logic" action="Narration + amount + customer + date">
        {matchedTxns.map((t) => <div className="match-row" key={t.id}><div><strong>{t.payerName}</strong><small>{t.narration}</small></div><span>{t.status}</span><b>{t.confidence}%</b></div>)}
      </Panel>
    </div>
  </section>;
}

function Transactions({ matchedTxns, approve }: { matchedTxns: BankTxn[]; approve: (txn: BankTxn) => void }) {
  return <Panel title="Daily Bank Statement Transactions" action="Sample import • CSV/XLSX-ready">
    <div className="toolbar"><button><UploadCloud size={16} /> Upload bank statement</button><button><Search size={16} /> Parse narration</button><button><SlidersHorizontal size={16} /> Filter exceptions</button></div>
    <DataTable headers={['Txn No', 'Date', 'Narration / Description', 'Customer', 'Company', 'Account', 'Paid', 'Applied', 'Unapplied', 'Match', 'Action']} rows={matchedTxns.map((t) => [t.txnNo, t.date, `${t.narration} — ${t.description}`, t.matchedCustomer || t.payerName, t.companyName, t.accountType, money(t.amount), money(t.appliedAmount), money(t.unappliedAmount), `${t.status} (${t.confidence}%)`, <button className="mini" onClick={() => approve(t)}>Knock-off</button>])} />
  </Panel>;
}

function Invoices() {
  return <Panel title="Invoice Data and AR Aging" action="Required fields visible">
    <DataTable headers={['Invoice', 'Txn No', 'Description', 'Customer', 'BU', 'Company', 'Account Type', 'Original', 'Applied', 'Due', 'Bucket', 'SLA']} rows={invoices.map((i) => [i.invoiceNo, i.transactionNo, i.transactionDescription, i.customerName, i.businessUnit, i.companyName, i.accountType, money(i.originalAmount), money(i.appliedAmount), money(i.amountDue), i.bucket, i.slaStatus])} />
  </Panel>;
}

function Reconciliation({ matchedTxns, approve }: { matchedTxns: BankTxn[]; approve: (txn: BankTxn) => void }) {
  return <section className="stack"><div className="grid three"><Metric label="Narration matched" value={`${matchedTxns.filter((t) => t.confidence >= 70).length}`} icon={<ReceiptText />} /><Metric label="Partial amount cases" value={`${matchedTxns.filter((t) => t.status === 'Partial Match').length}`} icon={<CircleDollarSign />} /><Metric label="Review queue" value={`${matchedTxns.filter((t) => ['Probable Match', 'Unapplied', 'Review Required'].includes(t.status)).length}`} icon={<ShieldCheck />} warn /></div><Panel title="Human Review and Knock-off Queue" action="Approve before posting"><div className="review-list">{matchedTxns.map((t) => <div className="review-card" key={t.id}><div><strong>{t.txnNo} → {t.matchedInvoice || 'No invoice'}</strong><p>{t.reason}</p><small>{t.narration}</small></div><div><b>{money(t.amount)}</b><span>{t.status}</span><button onClick={() => approve(t)}>Approve knock-off</button></div></div>)}</div></Panel></section>;
}

function SlaUpload() {
  return <section className="stack"><Panel title="Customer-wise Invoice SLA Upload" action="Supportings, SOA, LPO, customer confirmation"><div className="upload-box"><UploadCloud size={36} /><h3>Drop SLA/supporting files here</h3><p>Map documents to customer, invoice number, BU, company and SLA status. Supported design: PDF, XLSX, CSV, image evidence, email export.</p><button>Select files</button></div></Panel><Panel title="SLA Mapping Template" action="Demo fields"><DataTable headers={['Customer', 'Invoice', 'Document Type', 'SLA Status', 'Owner', 'Next Action']} rows={invoices.slice(0, 4).map((i) => [i.customerName, i.invoiceNo, 'SOA / Supportings', i.slaStatus, 'Finance O2C', 'Upload evidence and send customer confirmation'])} /></Panel></section>;
}

function Agents({ activeAgent, selectedAgent, setSelectedAgent, setPage }: { activeAgent: AgentConfig; selectedAgent: string; setSelectedAgent: (a: string) => void; setPage: (p: string) => void }) {
  return <section className="grid agent-layout"><Panel title="Agent Fleet" action="21st.dev model library"><div className="agent-list">{agents.map((a) => <button className={selectedAgent === a.name ? 'selected' : ''} key={a.name} onClick={() => setSelectedAgent(a.name)}><Bot size={18} /><div><strong>{a.name}</strong><small>{a.mcp.join(' • ')}</small></div><span>{a.status}</span></button>)}</div></Panel><Panel title={activeAgent.name} action={activeAgent.mode}><div className="agent-detail"><span className="model"><BrainCircuit size={16} /> {activeAgent.model}</span><h3>{activeAgent.purpose}</h3><p><b>Trigger:</b> {activeAgent.trigger}</p><p><b>MCP:</b> {activeAgent.mcp.join(', ')}</p><div className="chat"><div className="bot-msg">I am configured in demo mode. Add API key and MCP auth to run real tool calls.</div><div className="tool-call">Tool plan: authenticate → fetch data → validate → compute → require approval → write/log.</div></div><button onClick={() => setPage('API & Auth')}>Configure API and model</button></div></Panel></section>;
}

function ApiAuth({ apiProvider, setApiProvider, model, setModel }: { apiProvider: string; setApiProvider: (s: string) => void; model: string; setModel: (s: string) => void }) {
  return <section className="stack"><Panel title="API Key, Authentication and Model" action="No secrets shown in UI"><div className="form-grid"><label>Provider<select value={apiProvider} onChange={(e) => setApiProvider(e.target.value)}><option>Anthropic Managed Agents</option><option>OpenAI API</option><option>Vercel AI Gateway</option><option>Demo Runtime Only</option></select></label><label>Model<select value={model} onChange={(e) => setModel(e.target.value)}><option>claude-sonnet-4-6</option><option>gpt-5.5-thinking</option><option>gpt-5.5</option><option>local-demo-agent</option></select></label><label>API key status<input value="Not configured in Vercel/Supabase secrets" readOnly /></label><label>Supabase project<input value="dhcm-finance-hub" readOnly /></label></div><div className="warning"><KeyRound size={18} /> Add secrets in Vercel Project Settings and Supabase Edge Function secrets. Never paste real API keys into frontend code.</div></Panel><Panel title="Required Secrets" action="Backend only"><DataTable headers={['Secret', 'Purpose', 'Status']} rows={[['ANTHROPIC_API_KEY', 'Managed agents / Claude runtime', 'Missing'], ['VITE_SUPABASE_URL', 'Frontend Supabase URL', 'Required'], ['VITE_SUPABASE_PUBLISHABLE_KEY', 'Frontend publishable key', 'Required'], ['SLACK_BI_CHANNEL', 'BI recap channel', 'Optional'], ['GOOGLE_DRIVE_CLIENT_ID', 'Drive document workflow', 'Planned backend integration']]} /></Panel></section>;
}

function Audit({ approvalLog }: { approvalLog: string[] }) {
  return <Panel title="Audit Trail" action="Every reviewable action is logged"><div className="audit-list">{approvalLog.map((event, i) => <div key={i}><span>{new Date().toISOString()}</span><strong>{event}</strong></div>)}</div></Panel>;
}

function Metric({ label, value, icon, warn }: { label: string; value: string; icon: React.ReactNode; warn?: boolean }) {
  return <div className={`metric ${warn ? 'warn' : ''}`}><div>{icon}</div><small>{label}</small><strong>{value}</strong></div>;
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return <section className="panel"><header><div><small>{action}</small><h2>{title}</h2></div></header>{children}</section>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function iconFor(item: string) {
  const map: Record<string, React.ReactNode> = {
    Dashboard: <LayoutDashboard size={17} />,
    Transactions: <ReceiptText size={17} />,
    Invoices: <FileSpreadsheet size={17} />,
    'Bank Reconciliation': <Banknote size={17} />,
    'Invoice SLA Upload': <UploadCloud size={17} />,
    Agents: <Bot size={17} />,
    'API & Auth': <KeyRound size={17} />,
    Audit: <Database size={17} />
  };
  return map[item] || <Activity size={17} />;
}
