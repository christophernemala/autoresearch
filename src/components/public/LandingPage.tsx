import React from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Receipt,
  FileCheck2,
  PieChart,
  Wallet,
  Scale,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { brandConfig } from '../../config/brand';

interface LandingPageProps {
  onLaunchConsole: () => void;
  onOpenSso: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchConsole, onOpenSso }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#080d16', color: '#edf3fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #253346',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1a3760, #4d8dff)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', display: 'block' }}>
              {brandConfig.name}
            </strong>
            <span style={{ fontSize: '11px', color: '#96a6ba', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              SaaS Platform
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500, color: '#96a6ba' }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
          <a href="#governance" style={{ color: 'inherit', textDecoration: 'none' }}>Maker–Checker</a>
          <a href="#ifrs9" style={{ color: 'inherit', textDecoration: 'none' }}>IFRS 9 Engine</a>
          <a href="#security" style={{ color: 'inherit', textDecoration: 'none' }}>Security & SCO</a>
        </nav>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onOpenSso}
            style={{
              padding: '8px 16px',
              background: '#151f2e',
              border: '1px solid #253346',
              borderRadius: '6px',
              color: '#edf3fa',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Sign In / SSO
          </button>
          <button
            onClick={onLaunchConsole}
            style={{
              padding: '8px 18px',
              background: '#4d8dff',
              color: '#000',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Launch Console
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '96px 32px 64px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(77, 141, 255, 0.1)',
          border: '1px solid rgba(77, 141, 255, 0.3)',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#75a8ff',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={14} />
          <span>PRODUCTION-GRADE ORDER-TO-CASH (O2C) ORCHESTRATION</span>
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '56px',
          lineHeight: '1.08',
          letterSpacing: '-0.03em',
          fontWeight: 800,
          maxWidth: '900px',
          margin: '0 auto 20px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A0B2C6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Institutional Receivables Control & Multi-Agent Financial Governance
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#96a6ba',
          maxWidth: '740px',
          margin: '0 auto 36px'
        }}>
          Autonomous financial subledger operations with deterministic mathematics, IFRS 9 ECL provisioning,
          cash application straight-through processing, and cryptographic Maker–Checker four-eyes controls.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={onLaunchConsole}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #4d8dff, #2563eb)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 24px rgba(77, 141, 255, 0.3)'
            }}
          >
            Enter Financial Command Center
            <ArrowRight size={16} />
          </button>
          <button
            onClick={onOpenSso}
            style={{
              padding: '14px 24px',
              background: '#111a26',
              border: '1px solid #253346',
              borderRadius: '8px',
              color: '#edf3fa',
              fontSize: '15px',
              fontWeight: 600
            }}
          >
            Authenticate via Entra ID / Okta
          </button>
        </div>

        {/* Institutional Metrics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '64px',
          padding: '24px',
          background: '#111a26',
          border: '1px solid #253346',
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#96a6ba', textTransform: 'uppercase', fontWeight: 700 }}>ECL Governance</span>
            <strong style={{ display: 'block', fontSize: '24px', color: '#edf3fa', margin: '4px 0' }}>IFRS 9 / CECL</strong>
            <span style={{ fontSize: '12px', color: '#44d19d' }}>Simplified Loss Matrix</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#96a6ba', textTransform: 'uppercase', fontWeight: 700 }}>Segregation of Duties</span>
            <strong style={{ display: 'block', fontSize: '24px', color: '#edf3fa', margin: '4px 0' }}>Four-Eyes Control</strong>
            <span style={{ fontSize: '12px', color: '#44d19d' }}>SHA-256 Tamper Guard</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#96a6ba', textTransform: 'uppercase', fontWeight: 700 }}>Straight-Through Match</span>
            <strong style={{ display: 'block', fontSize: '24px', color: '#edf3fa', margin: '4px 0' }}>&ge; 98% Confidence</strong>
            <span style={{ fontSize: '12px', color: '#44d19d' }}>Deterministic Rules Engine</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#96a6ba', textTransform: 'uppercase', fontWeight: 700 }}>Compliance Framework</span>
            <strong style={{ display: 'block', fontSize: '24px', color: '#edf3fa', margin: '4px 0' }}>SOC 2 Type II</strong>
            <span style={{ fontSize: '12px', color: '#44d19d' }}>Hash-Chained Audit Log</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '64px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', color: '#4d8dff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Enterprise Capabilities
          </span>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', fontWeight: 700, margin: '8px 0 12px' }}>
            The 6 Mission-Critical O2C Pillars
          </h2>
          <p style={{ color: '#96a6ba', fontSize: '15px' }}>
            Deterministic operational agents combined with human approval checkpoints for material exposure.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <Receipt style={{ color: '#4d8dff', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>1. Order Intake & Credit Check</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              Calculates real-time exposure ($Open AR + Open Orders + Unbilled$). Enforces automated credit holds and sanction lists.
            </p>
          </div>

          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <FileCheck2 style={{ color: '#44d19d', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>2. Billing & Invoicing Engine</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              Deterministic tax calculation (VAT/GST/exempt) with duplicate invoice prevention and high-value controller sign-offs.
            </p>
          </div>

          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <Activity style={{ color: '#e6b450', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>3. Collections Orchestration</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              Configurable aging buckets (Current to 361+ days), Dunning strategies, promise-to-pay tracking, and legal escalations.
            </p>
          </div>

          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <Wallet style={{ color: '#54c7d8', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>4. Cash Application Matching</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              Hierarchical matching algorithms for bank statements against open receivables with STP thresholds (&ge;98% auto-post).
            </p>
          </div>

          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <PieChart style={{ color: '#ef6f7a', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>5. Credit Risk & IFRS 9 ECL</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              Provision matrices ($ECL = PD \times LGD \times EAD$) with forward-looking macroeconomic overlays and 100% loss logic for 361+ days.
            </p>
          </div>

          <div style={{ background: '#111a26', border: '1px solid #253346', borderRadius: '10px', padding: '24px' }}>
            <Scale style={{ color: '#a78bfa', marginBottom: '14px' }} size={28} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>6. Dispute Resolution Hub</h3>
            <p style={{ fontSize: '13px', color: '#96a6ba', lineHeight: '1.6', margin: 0 }}>
              11 root-cause dispute categories, SLA deadline escalation, and Maker–Checker governed credit memo adjustments.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #253346',
        padding: '32px',
        textAlign: 'center',
        color: '#6f8196',
        fontSize: '13px'
      }}>
        <p style={{ margin: 0 }}>
          &copy; {brandConfig.copyrightYear} {brandConfig.companyName}. All rights reserved. Built for institutional financial control.
        </p>
      </footer>
    </div>
  );
};
