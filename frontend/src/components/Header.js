import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Activity, User, ChevronDown } from 'lucide-react';

const Header = ({ account, chainId, user, onConnect, onDisconnect, onLogout, isConnecting }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    if (chainId === 80001) return 'Mumbai';
    if (chainId === 137) return 'Polygon';
    if (chainId === 1) return 'Mainnet';
    if (chainId === 11155111) return 'Sepolia';
    return 'Local';
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':     return { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' };
      case 'supervisor': return { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' };
      case 'citizen':   return { bg: '#F0FDF4', color: '#166534', dot: '#16A34A' };
      default:          return { bg: '#F9FAFB', color: '#374151', dot: '#9CA3AF' };
    }
  };

  const roleStyle = user ? getRoleBadgeStyle(user.role) : null;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '64px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 32px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>

        {/* ── LEFT: Brand + Nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: '1 1 0' }}>

          {/* Brand */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0F62FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Activity size={16} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.01em',
              fontFamily: 'Inter, sans-serif',
            }}>
              CivicLedger
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <NavLink to="/" active={isActive('/')} testId="nav-dashboard">Overview</NavLink>

            {user?.role === 'admin' && (
              <NavLink to="/create" active={isActive('/create')} testId="nav-create-project">
                Create Project
              </NavLink>
            )}

            {user?.role === 'supervisor' && (
              <>
                <NavLink to="/supervisor/approvals" active={isActive('/supervisor/approvals')} testId="nav-supervisor-approvals">
                  Tender Approvals
                </NavLink>
                <NavLink to="/supervisor/verifications" active={isActive('/supervisor/verifications')} testId="nav-supervisor-verifications">
                  Verifications
                </NavLink>
              </>
            )}

            <NavLink to="/transactions" active={isActive('/transactions')} testId="nav-transactions">
              Transactions
            </NavLink>
          </nav>
        </div>

        {/* ── RIGHT: Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Role Badge */}
          {user && roleStyle && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: roleStyle.bg,
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: roleStyle.dot,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: roleStyle.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: 'Inter, sans-serif',
              }}>
                {user.role}
              </span>
            </div>
          )}

          {/* Separator */}
          {user && account && (
            <div style={{ width: '1px', height: '20px', background: '#E5E7EB', margin: '0 2px' }} />
          )}

          {/* Wallet area */}
          {account ? (
            <>
              {/* Network chip */}
              {chainId && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: '#F0FDF4',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#16A34A',
                    animation: 'ciPulse 2s ease-in-out infinite',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#166534', fontFamily: 'Inter, sans-serif' }}>
                    {getNetworkName(chainId)}
                  </span>
                </div>
              )}

              {/* Address chip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#3B82F6',
                  flexShrink: 0,
                }} />
                <span
                  data-testid="wallet-address"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    fontFamily: 'monospace',
                    letterSpacing: '0.01em',
                  }}
                >
                  {formatAddress(account)}
                </span>
              </div>

              {/* Disconnect */}
              <HeaderButton
                onClick={onDisconnect}
                variant="outline"
                testId="disconnect-wallet-btn"
              >
                <LogOut size={14} strokeWidth={2} />
                Disconnect
              </HeaderButton>
            </>
          ) : (
            <HeaderButton
              onClick={onConnect}
              disabled={isConnecting}
              variant="primary"
              testId="connect-wallet-btn"
            >
              <Wallet size={14} strokeWidth={2} />
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </HeaderButton>
          )}

          {/* Logout */}
          {user && (
            <HeaderButton
              onClick={onLogout}
              variant="danger"
              testId="logout-btn"
            >
              <LogOut size={14} strokeWidth={2} />
              Logout
            </HeaderButton>
          )}
        </div>
      </div>
    </header>
  );
};

/* ── Sub-components ── */

const NavLink = ({ to, active, children, testId }) => (
  <Link
    to={to}
    data-testid={testId}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      color: active ? '#0F62FE' : '#6B7280',
      textDecoration: 'none',
      fontFamily: 'Inter, sans-serif',
      background: active ? '#EFF6FF' : 'transparent',
      transition: 'color 0.12s, background 0.12s',
      position: 'relative',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.color = '#111827';
        e.currentTarget.style.background = '#F9FAFB';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.color = '#6B7280';
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    {children}
  </Link>
);

const HeaderButton = ({ onClick, disabled, variant = 'outline', testId, children }) => {
  const styles = {
    primary: {
      background: '#0F62FE',
      color: '#FFFFFF',
      border: 'none',
      hoverBg: '#0043CE',
      hoverColor: '#FFFFFF',
    },
    outline: {
      background: '#FFFFFF',
      color: '#374151',
      border: '1px solid #E5E7EB',
      hoverBg: '#F9FAFB',
      hoverColor: '#111827',
    },
    danger: {
      background: 'transparent',
      color: '#EF4444',
      border: 'none',
      hoverBg: '#FEF2F2',
      hoverColor: '#DC2626',
    },
  };

  const s = styles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        background: s.background,
        color: s.color,
        border: s.border || 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.12s, color 0.12s, box-shadow 0.12s',
        whiteSpace: 'nowrap',
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = s.hoverBg;
          e.currentTarget.style.color = s.hoverColor;
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,98,254,0.25)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = s.background;
        e.currentTarget.style.color = s.color;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
};

export default Header;