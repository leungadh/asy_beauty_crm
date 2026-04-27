// app.jsx — root component, routing, auth, store

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "sage",
  "density": "comfy",
  "radius": "round"
}/*EDITMODE-END*/;

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ initialError = '' }) {
  const [email, setEmail] = useStateApp('');
  const [sending, setSending] = useStateApp(false);
  const [sent, setSent] = useStateApp(false);
  const [error, setError] = useStateApp(initialError);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true); setError('');
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the link. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '44px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-title">ASY Beauté</div>
            <div className="brand-sub">CRM</div>
          </div>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--good-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <Icons.Check size={22} style={{ color: 'var(--good)' }} strokeWidth={2.5} />
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10 }}>Check your inbox</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6 }}>
              We sent a sign-in link to <strong style={{ color: 'var(--ink-2)' }}>{email}</strong>.
              Click it to continue — no password needed.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Sign in</h1>
            <div style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 24 }}>Enter your email to receive a one-tap sign-in link.</div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            {error && <div style={{ color: 'var(--bad)', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              disabled={sending || !email.trim()}>
              {sending ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 14 }}>Loading…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [route, setRoute] = useStateApp('dashboard');
  const [customerId, setCustomerId] = useStateApp(null);

  // null = checking, false = not logged in, object = session
  const [session, setSessionState] = useStateApp(null);
  const [store, setStore] = useStateApp({ customers: [], loading: true });

  // Apply tweaks to <body>
  useEffectApp(() => {
    document.body.dataset.variant = t.variant;
    document.body.dataset.density = t.density;
    document.body.dataset.radius  = t.radius;
  }, [t.variant, t.density, t.radius]);

  const [authError, setAuthError] = useStateApp('');

  // Auth init — skip entirely in demo mode, use seed data
  useEffectApp(() => {
    if (DEMO_MODE) {
      setSessionState({ demo: true });
      setStore({ customers: seedCustomers, loading: false });
      return;
    }
    async function init() {
      const callbackResult = await handleAuthCallback();
      if (typeof callbackResult === 'string' && callbackResult.startsWith('error:')) {
        setAuthError(callbackResult.slice(6));
        setSessionState(false);
        setStore({ customers: [], loading: false });
        return;
      }
      const s = await ensureSession();
      setSessionState(s || false);
      if (s) {
        try {
          const loaded = await loadStore();
          setStore({ ...loaded, loading: false });
        } catch {
          setStore({ customers: [], loading: false });
        }
      } else {
        setStore({ customers: [], loading: false });
      }
    }
    init();
  }, []);

  const [showToast, toastNode] = useToast();

  function go(r) {
    if (r === 'dashboard' || r === 'new' || r === 'search') {
      setRoute(r); setCustomerId(null);
      window.scrollTo({ top: 0 });
    }
  }
  function openCustomer(id) {
    setCustomerId(id); setRoute('customer');
    window.scrollTo({ top: 0 });
  }

  // Still checking auth
  if (session === null) return <LoadingScreen />;

  // Not logged in
  if (session === false) return <LoginScreen initialError={authError} />;

  // Fetching data
  if (store.loading) return <LoadingScreen />;

  let page;
  if (route === 'dashboard') page = <PageDashboard store={store} go={go} openCustomer={openCustomer} />;
  else if (route === 'new')   page = <PageNewVisit  store={store} setStore={setStore} go={go} showToast={showToast} />;
  else if (route === 'search')page = <PageSearch    store={store} go={go} openCustomer={openCustomer} />;
  else if (route === 'customer') page = <PageCustomer store={store} setStore={setStore} customerId={customerId} go={go} showToast={showToast} />;

  const titles = { dashboard: 'Dashboard', new: 'New visit', search: 'Customers', customer: 'Customer' };

  return (
    <div className="app">
      <Sidebar route={route} go={go} customerCount={store.customers.length} />
      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>ASY Beauté</span>
            <span className="sep">/</span>
            <span className="here">{titles[route]}</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm btn-icon" title="Notifications"><Icons.Bell size={16} /></button>
            {DEMO_MODE
              ? <span className="pill" style={{ fontSize: 11 }}>Demo mode</span>
              : <button className="btn btn-sm" onClick={() => {
                  if (confirm('Sign out?')) { clearSession(); location.reload(); }
                }}>Sign out</button>
            }
          </div>
        </div>
        {page}
      </div>
      <MobileNav route={route} go={go} />
      {toastNode}

      <TweaksPanel>
        <TweakSection label="Color theme" />
        <TweakRadio label="Palette" value={t.variant}
          options={['blue', 'rose', 'sage']}
          onChange={(v) => setTweak('variant', v)} />
        <TweakSection label="Density" />
        <TweakRadio label="Spacing" value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Corners" />
        <TweakRadio label="Roundness" value={t.radius}
          options={['sharp', 'round', 'pill']}
          onChange={(v) => setTweak('radius', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
