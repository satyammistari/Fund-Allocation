import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, TrendingUp, DollarSign, FolderOpen, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import TransactionVerificationModal from './TransactionVerificationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ── Design tokens ── */
const T = {
  white: '#FFFFFF',
  bg: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#111827',
  textSec: '#6B7280',
  textMuted: '#9CA3AF',
  primary: '#0F62FE',
  primaryHover: '#0043CE',
  primaryLight: '#EFF6FF',
  success: '#16A34A',
  successBg: '#DCFCE7',
  purple: '#7C3AED',
  purpleBg: '#EDE9FE',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  info: '#1D4ED8',
  infoBg: '#DBEAFE',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  radius: '12px',
  radiusSm: '8px',
  radiusXs: '6px',
  radiusFull: '9999px',
};

/* ── Reusable primitives ── */

const Card = ({ children, style = {}, ...rest }) => (
  <div style={{
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    ...style,
  }} {...rest}>
    {children}
  </div>
);

const Label = ({ children, style = {} }) => (
  <span style={{
    fontSize: '10px',
    fontWeight: '600',
    color: T.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: 'Inter, sans-serif',
    ...style,
  }}>
    {children}
  </span>
);

const Pill = ({ children, bg, color }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: T.radiusFull,
    fontSize: '11px',
    fontWeight: '600',
    background: bg,
    color,
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

const ProgressBar = ({ value, color = T.primary, height = 6 }) => (
  <div style={{
    height,
    background: T.borderLight,
    borderRadius: T.radiusFull,
    overflow: 'hidden',
  }}>
    <div style={{
      height: '100%',
      width: `${Math.min(Math.max(value || 0, 0), 100)}%`,
      background: color,
      borderRadius: T.radiusFull,
      transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
    }} />
  </div>
);

const PrimaryButton = ({ children, onClick, to, testId, style = {} }) => {
  const [hovered, setHovered] = React.useState(false);
  const btn = (
    <button
      onClick={onClick}
      data-testid={testId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 16px',
        borderRadius: T.radiusSm,
        fontSize: '13px',
        fontWeight: '600',
        color: T.white,
        background: hovered ? T.primaryHover : T.primary,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'background 0.12s, box-shadow 0.12s',
        boxShadow: hovered ? '0 2px 8px rgba(15,98,254,0.28)' : 'none',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{btn}</Link> : btn;
};

const GhostButton = ({ children, onClick, testId, style = {} }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        height: '32px',
        padding: '0 10px',
        borderRadius: T.radiusSm,
        fontSize: '12px',
        fontWeight: '600',
        color: T.primary,
        background: hovered ? T.primaryLight : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'background 0.12s',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const IconButton = ({ children, onClick, testId, title }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: T.radiusXs,
        background: hovered ? T.borderLight : 'transparent',
        border: `1px solid ${hovered ? T.border : 'transparent'}`,
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        outline: 'none',
        color: T.textMuted,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

/* ── KPI Stat Card ── */
const StatCard = ({ label, value, sub, icon: Icon, iconColor = T.textMuted, testId }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Card
      style={{
        padding: '20px',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={testId}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Label>{label}</Label>
        {Icon && <Icon size={18} color={iconColor} strokeWidth={1.75} />}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '700', color: T.text, letterSpacing: '-0.025em', lineHeight: 1, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: T.textSec, fontFamily: 'Inter, sans-serif' }}>{sub}</div>
    </Card>
  );
};

/* ── Fund Flow metric column ── */
const FlowMetric = ({ dot, label, value, badge, badgeBg, badgeColor, borderRight }) => (
  <div style={{
    flex: 1,
    padding: '0 24px',
    borderRight: borderRight ? `1px solid ${T.borderLight}` : 'none',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', color: T.textSec, fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </div>
    <div style={{ fontSize: '22px', fontWeight: '700', color: T.text, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
      {value}
    </div>
    {badge && (
      <Pill bg={badgeBg} color={badgeColor}>{badge}</Pill>
    )}
  </div>
);

/* ── Category row ── */
const CategoryRow = ({ category, spent, budget }) => {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
  return (
    <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: `1px solid ${T.borderLight}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{category}</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: T.text, fontFamily: 'Inter, sans-serif' }}>{fmt(spent)}</span>
          <span style={{ fontSize: '11px', color: T.textMuted, fontFamily: 'Inter, sans-serif' }}> / {fmt(budget)}</span>
        </div>
      </div>
      <ProgressBar value={pct} color={pct > 80 ? T.error : pct > 50 ? T.warning : T.primary} height={5} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: T.textMuted, fontFamily: 'Inter, sans-serif' }}>{pct.toFixed(1)}% spent</span>
        <span style={{ fontSize: '11px', color: T.textMuted, fontFamily: 'Inter, sans-serif' }}>Remaining: {fmt(budget - spent)}</span>
      </div>
    </div>
  );
};

/* ── Project Card ── */
const ProjectCard = ({ project, index, onVerify }) => {
  const [hovered, setHovered] = React.useState(false);
  const spentFunds = project.spent_funds || project.spentFunds || 0;
  const allocatedFunds = project.allocated_funds || project.allocatedFunds || 0;
  const budget = project.budget || 0;
  const progress = budget > 0 ? Math.min((spentFunds / budget) * 100, 100) : 0;
  const isActive = project.status === 'Active' || project.status === 'active';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);

  return (
    <Card
      style={{
        padding: '20px',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.2s',
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`project-card-${index}`}
    >
      {/* Row 1: Name + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: T.text, fontFamily: 'Inter, sans-serif', margin: 0, letterSpacing: '-0.01em' }}>
          {project.name || 'Unnamed Project'}
        </h3>
        <Pill bg={isActive ? T.successBg : T.infoBg} color={isActive ? T.success : T.info}>
          {project.status || 'Unknown'}
        </Pill>
      </div>

      {/* Row 2: Description + Category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <Pill bg={T.infoBg} color={T.info}>{project.category || 'Uncategorized'}</Pill>
        <span style={{ fontSize: '13px', color: T.textSec, fontFamily: 'Inter, sans-serif' }}>
          {project.description || 'No description'}
        </span>
      </div>

      {/* Row 3: Progress */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: T.textSec, fontFamily: 'Inter, sans-serif' }}>Spending Progress</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: T.text, fontFamily: 'Inter, sans-serif' }}>{progress.toFixed(1)}%</span>
        </div>
        <ProgressBar value={progress} color={T.primary} height={5} />
      </div>

      {/* Row 4: Fund metrics */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {[
          { label: 'Allocated', value: fmt(allocatedFunds) },
          { label: 'Spent', value: fmt(spentFunds) },
          { label: 'Available', value: fmt(allocatedFunds - spentFunds), color: T.warning },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <Label>{label}</Label>
            <div style={{ fontSize: '13px', fontWeight: '600', color: color || T.text, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Row 5: Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '14px',
        borderTop: `1px solid ${T.borderLight}`,
      }}>
        <span style={{ fontSize: '11px', color: T.textMuted, fontFamily: 'monospace' }}>
          {project.manager_address
            ? `${project.manager_address.slice(0, 8)}…${project.manager_address.slice(-6)}`
            : '—'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {project.tx_hash && (
            <IconButton
              onClick={() => onVerify(project.tx_hash, 'project_create', { name: project.name, budget: project.budget, category: project.category })}
              testId={`verify-tx-${index}`}
              title="View Transaction"
            >
              <ExternalLink size={14} color={T.textMuted} />
            </IconButton>
          )}
          <Link to={`/project/${project.id}`} style={{ textDecoration: 'none' }}>
            <button
              data-testid={`view-details-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '32px',
                padding: '0 12px',
                borderRadius: T.radiusXs,
                fontSize: '13px',
                fontWeight: '600',
                color: T.primary,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.12s',
                outline: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View Details <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
const Dashboard = ({ account, user }) => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, txHash: '', type: '', details: {} });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, statsRes] = await Promise.all([
        axios.get(`${API}/projects`),
        axios.get(`${API}/stats`),
      ]);
      setProjects(projectsRes.data.projects || projectsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const handleVerifyTransaction = (txHash, type, details) =>
    setVerificationModal({ isOpen: true, txHash, type: type || 'project_create', details: details || {} });

  const getProgressPercentage = (spent, budget) =>
    budget ? Math.min((spent / budget) * 100, 100) : 0;

  /* Loading state */
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'ciSpin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <span style={{ fontSize: '14px', color: T.textSec, fontFamily: 'Inter, sans-serif' }}>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px 64px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '40px 0 24px',
          borderBottom: `1px solid ${T.border}`,
          marginBottom: '32px',
        }}>
          <div>
            <Label style={{ display: 'block', marginBottom: '6px' }}>Overview</Label>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: T.text, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Municipal Fund Transparency
            </h1>
            <p style={{ fontSize: '14px', color: T.textSec, margin: '6px 0 0' }}>
              Real-time blockchain tracking of government project funding
            </p>
          </div>
          {user?.role === 'admin' && (
            <PrimaryButton to="/create" testId="create-project-btn">
              <Plus size={14} strokeWidth={2.5} /> New Project
            </PrimaryButton>
          )}
        </div>

        {/* ── KPI CARDS ── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
            <StatCard label="Total Projects" value={stats.total_projects} sub={`${stats.active_projects} active`} icon={FolderOpen} iconColor={T.primary} testId="stat-total-projects" />
            <StatCard label="Allocated Funds" value={formatCurrency(stats.total_allocated)} sub={`of ${formatCurrency(stats.total_budget)} budget`} icon={DollarSign} iconColor={T.success} testId="stat-total-budget" />
            <StatCard label="Funds Spent" value={formatCurrency(stats.total_spent)} sub={`${stats.budget_utilization?.toFixed(1)}% of budget used`} icon={TrendingUp} iconColor={T.purple} testId="stat-total-spent" />
            <StatCard label="Milestones" value={stats.completed_milestones} sub={`of ${stats.total_milestones} completed`} icon={CheckCircle2} iconColor={T.success} testId="stat-completed-milestones" />
          </div>
        )}

        {/* ── FUND FLOW CARD ── */}
        {stats && (
          <Card style={{ marginBottom: '24px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${T.borderLight}` }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: T.text, margin: '0 0 2px', letterSpacing: '-0.01em' }}>Fund Overview</h2>
                <p style={{ fontSize: '12px', color: T.textSec, margin: 0 }}>Budget allocation and spending across all projects</p>
              </div>
            </div>

            {/* Metric strip */}
            <div style={{ display: 'flex', padding: '20px 0 20px 24px', borderBottom: `1px solid ${T.borderLight}` }}>
              <FlowMetric dot="#3B82F6" label="Total Budget" value={formatCurrency(stats.total_budget)} borderRight />
              <FlowMetric dot={T.success} label="Allocated" value={formatCurrency(stats.total_allocated)} badge={`${stats.allocation_rate?.toFixed(1)}% of budget`} badgeBg={T.successBg} badgeColor={T.success} borderRight />
              <FlowMetric dot={T.purple} label="Spent" value={formatCurrency(stats.total_spent)} badge={`${stats.spending_rate?.toFixed(1)}% of allocated`} badgeBg={T.purpleBg} badgeColor={T.purple} borderRight />
              <FlowMetric dot={T.warning} label="Remaining" value={formatCurrency(stats.allocated_unspent || 0)} badge="Available to spend" badgeBg={T.warningBg} badgeColor={T.warning} />
            </div>

            {/* Progress bars */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Budget Allocation', pct: stats.allocation_rate, color: T.success },
                { label: 'Spending Progress', pct: stats.budget_utilization, color: T.purple },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: T.textSec }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>{(pct || 0).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={pct} color={color} height={6} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── BOTTOM ROW: Category + Projects ── */}
        <div style={{ display: 'grid', gridTemplateColumns: stats?.budget_by_project_category && Object.keys(stats.budget_by_project_category).length > 0 ? '340px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>

          {/* Budget by Category */}
          {stats?.budget_by_project_category && Object.keys(stats.budget_by_project_category).length > 0 && (
            <Card>
              <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.borderLight}` }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: T.text, margin: '0 0 2px', letterSpacing: '-0.01em' }}>Budget by Category</h2>
                <p style={{ fontSize: '12px', color: T.textSec, margin: 0 }}>Spending distribution by sector</p>
              </div>
              <div style={{ padding: '20px 24px 4px' }}>
                {Object.entries(stats.budget_by_project_category).map(([category, budget]) => {
                  const spent = stats.spent_by_project_category?.[category] || 0;
                  return <CategoryRow key={category} category={category} spent={spent} budget={budget} />;
                })}
              </div>
            </Card>
          )}

          {/* All Projects */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: T.text, margin: 0, letterSpacing: '-0.015em' }}>All Projects</h2>
              <span style={{ fontSize: '12px', color: T.textMuted, fontFamily: 'Inter, sans-serif' }}>
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {projects.length === 0 ? (
              <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
                <FolderOpen size={40} color={T.border} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '15px', fontWeight: '500', color: T.text, margin: '0 0 4px' }}>No projects yet</p>
                <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 16px' }}>Create your first project to start tracking funds.</p>
                {user?.role === 'admin' && (
                  <PrimaryButton to="/create" testId="create-first-project-btn">
                    <Plus size={14} /> Create Project
                  </PrimaryButton>
                )}
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onVerify={handleVerifyTransaction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, txHash: '', type: '', details: {} })}
        txHash={verificationModal.txHash}
        type={verificationModal.type}
        details={verificationModal.details}
      />
    </div>
  );
};

export default Dashboard;