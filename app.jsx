// app.jsx — root component, routing, store, tweaks panel

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

// Tweakable defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "blue",
  "density": "regular",
  "radius": "round"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // route: 'dashboard' | 'new' | 'search' | 'customer/:id'
  const [route, setRoute] = useStateApp('dashboard');
  const [customerId, setCustomerId] = useStateApp(null);

  const [store, setStore] = useStateApp(() => loadStore());
  useEffectApp(() => { saveStore(store); }, [store]);

  // Apply tweaks to <body>
  useEffectApp(() => {
    document.body.dataset.variant = t.variant;
    document.body.dataset.density = t.density;
    document.body.dataset.radius = t.radius;
  }, [t.variant, t.density, t.radius]);

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

  let page;
  if (route === 'dashboard') page = <PageDashboard store={store} go={go} openCustomer={openCustomer} />;
  else if (route === 'new') page = <PageNewVisit store={store} setStore={setStore} go={go} showToast={showToast} />;
  else if (route === 'search') page = <PageSearch store={store} go={go} openCustomer={openCustomer} />;
  else if (route === 'customer') page = <PageCustomer store={store} setStore={setStore} customerId={customerId} go={go} showToast={showToast} />;

  const customers = useMemoApp(() => store.customers, [store.customers]);
  const titles = { dashboard: 'Dashboard', new: 'New visit', search: 'Customers', customer: 'Customer' };

  return (
    <div className="app">
      <Sidebar route={route} go={go} customerCount={customers.length} />
      <div className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>ASY Beauté</span>
            <span className="sep">/</span>
            <span className="here">{titles[route]}</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm btn-icon" title="Notifications"><Icons.Bell size={16} /></button>
            <button className="btn btn-sm" onClick={() => {
              if (confirm('Reset to demo data? This will clear any visits you added.')) {
                resetStore(); setStore(loadStore()); showToast('Demo data restored');
              }
            }}>
              <Icons.Download size={14} /> Reset demo
            </button>
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

        <TweakSection label="Demo data" />
        <TweakButton label="Reset to seed" onClick={() => {
          resetStore(); setStore(loadStore()); showToast('Demo data restored');
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
