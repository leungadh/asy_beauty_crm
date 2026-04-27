// components.jsx — shared UI atoms

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Star rating ─────────────────────────────────────────
function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hover, setHover] = useState(0);
  const v = hover || value;
  return (
    <div className={`stars ${readOnly ? 'stars-readonly' : ''}`}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${i <= v ? 'on' : ''}`}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange && onChange(i)}>
          <Icons.Star size={size} fill={i <= v ? 'currentColor' : 'none'} />
        </span>
      ))}
    </div>
  );
}

// ── Service button ─────────────────────────────────────
function ServiceButton({ service, on, onClick, hideMeta }) {
  const I = Icons[service.icon] || Icons.Sparkle;
  return (
    <button type="button" className={`svc-btn ${on ? 'on' : ''}`} onClick={onClick}>
      <span className="svc-check"><Icons.Check size={12} strokeWidth={3} /></span>
      <span className="svc-icon-wrap"><I size={20} /></span>
      <span className="svc-name">{service.name}</span>
      {!hideMeta && (
        <span className="svc-meta">
          {service.price > 0 && <span className="price">{fmtMoney(service.price)}</span>}
          <span>{service.duration} min</span>
        </span>
      )}
    </button>
  );
}

// ── Toast ──────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2400);
  }, []);
  const node = msg ? (
    <div className="toast">
      <Icons.Check size={16} strokeWidth={2.5} />
      <span>{msg}</span>
    </div>
  ) : null;
  return [show, node];
}

// ── Sidebar / nav ──────────────────────────────────────
function Sidebar({ route, go, customerCount }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', ico: 'Chart' },
    { id: 'new',       label: 'New Visit', ico: 'Plus' },
    { id: 'search',    label: 'Customers', ico: 'Users', badge: customerCount },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-title">ASY Beauté</div>
          <div className="brand-sub">CRM</div>
        </div>
      </div>
      <div className="nav-section">Workspace</div>
      {items.map(it => {
        const I = Icons[it.ico];
        return (
          <div key={it.id} className={`nav-item ${route.startsWith(it.id) ? 'active' : ''}`}
               onClick={() => go(it.id)}>
            <I className="ico" />
            <span>{it.label}</span>
            {it.badge != null && <span className="badge">{it.badge}</span>}
          </div>
        );
      })}
      <div className="nav-spacer" />
      <div className="user-card">
        <div className="avatar">AS</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>ASY Beauté</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>9544 0969</div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ route, go }) {
  const items = [
    { id: 'dashboard', label: 'Home',   ico: 'Chart' },
    { id: 'new',       label: 'New',    ico: 'Plus' },
    { id: 'search',    label: 'Customers', ico: 'Users' },
  ];
  return (
    <div className="mobile-nav">
      {items.map(it => {
        const I = Icons[it.ico];
        return (
          <div key={it.id} className={`nav-item ${route.startsWith(it.id) ? 'active' : ''}`}
               onClick={() => go(it.id)}>
            <I className="ico" />
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Service tag list (small) ───────────────────────────
function ServiceTags({ ids }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {ids.map(id => {
        const s = SVC_BY_ID[id]; if (!s) return null;
        const I = Icons[s.icon];
        return (
          <span key={id} className="pill">
            <I size={12} />
            {s.name}
          </span>
        );
      })}
    </span>
  );
}

// ── Avatar stub ────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const cls = size === 'lg' ? 'avatar avatar-lg' : size === 'sm' ? 'avatar avatar-sm' : 'avatar';
  return <div className={cls}>{initials(name)}</div>;
}

window.StarRating = StarRating;
window.ServiceButton = ServiceButton;
window.useToast = useToast;
window.Sidebar = Sidebar;
window.MobileNav = MobileNav;
window.ServiceTags = ServiceTags;
window.Avatar = Avatar;
