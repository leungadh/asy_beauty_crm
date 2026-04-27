// page-dashboard.jsx — Overview + data mining (revenue by service, popular services)

const { useMemo: useMemoD } = React;

function PageDashboard({ store, go, openCustomer }) {
  const data = useMemoD(() => {
    const customers = store.customers.map(enrich);
    const allVisits = customers.flatMap(c => c.visits.map(v => ({ ...v, customerId: c.id, customerName: c.name })));
    const now = new Date();
    const last30 = allVisits.filter(v => (now - new Date(v.date)) / 86400000 <= 30);
    const prev30 = allVisits.filter(v => {
      const d = (now - new Date(v.date)) / 86400000;
      return d > 30 && d <= 60;
    });

    // Revenue by service
    const revByService = {};
    const countByService = {};
    allVisits.forEach(v => {
      const share = v.services.length ? v.price / v.services.length : 0;
      v.services.forEach(s => {
        revByService[s]   = (revByService[s] || 0) + share;
        countByService[s] = (countByService[s] || 0) + 1;
      });
    });

    const totalRevenue = allVisits.reduce((s,v)=>s+v.price, 0);
    const rev30 = last30.reduce((s,v)=>s+v.price, 0);
    const revPrev = prev30.reduce((s,v)=>s+v.price, 0);
    const revDelta = revPrev > 0 ? ((rev30 - revPrev) / revPrev * 100) : 0;

    // Lapsed customers (>90d, ever visited)
    const lapsed = customers.filter(c => {
      const d = daysSince(c.lastVisit);
      return d != null && d > 90;
    });
    const newThisMonth = customers.filter(c => daysSince(c.createdAt) <= 30);

    // Recent visits
    const recent = [...allVisits].sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time)).slice(0, 6);

    return {
      customers, allVisits, last30, prev30,
      revByService, countByService,
      totalRevenue, rev30, revPrev, revDelta,
      lapsed, newThisMonth, recent,
    };
  }, [store.customers]);

  const sortedRev = Object.entries(data.revByService).sort((a,b) => b[1]-a[1]);
  const sortedCount = Object.entries(data.countByService).sort((a,b) => b[1]-a[1]);
  const maxRev = sortedRev[0]?.[1] || 1;
  const maxCount = sortedCount[0]?.[1] || 1;

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Welcome back, <em>Asy</em></h1>
          <div className="page-sub">{new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Here's what's happening at the salon.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => go('new')}>
          <Icons.Plus size={16} strokeWidth={2.5} /> New visit
        </button>
      </div>

      {/* CTA card */}
      <div className="quick-action" onClick={() => go('new')} style={{ marginBottom: 22 }}>
        <div className="qa-ico"><Icons.Plus size={26} strokeWidth={2.5} /></div>
        <div style={{ flex: 1 }}>
          <h3>Just finished with a customer?</h3>
          <p>Tap to record the visit, capture feedback, and add your notes.</p>
        </div>
        <Icons.ArrowRight size={20} />
      </div>

      {/* KPIs */}
      <div className="grid-4">
        <div className="card stat-card">
          <div className="stat-label"><Icons.Money size={14} /> Revenue (30d)</div>
          <div className="stat-value">{fmtMoney(data.rev30)}</div>
          <div className={`stat-delta ${data.revDelta < 0 ? 'neg' : ''}`}>
            {data.revDelta >= 0 ? <Icons.TrendUp size={12} /> : <Icons.TrendDown size={12} />}
            {Math.abs(data.revDelta).toFixed(0)}% vs prev. 30d
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Calendar size={14} /> Visits (30d)</div>
          <div className="stat-value">{data.last30.length}</div>
          <div className="stat-delta">
            <Icons.TrendUp size={12} /> {data.last30.length - data.prev30.length} vs prev.
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Sparkle size={14} /> New customers</div>
          <div className="stat-value">{data.newThisMonth.length}</div>
          <div className="stat-delta" style={{ color: 'var(--ink-3)' }}>this month</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Bell size={14} /> Lapsed (>90d)</div>
          <div className="stat-value">{data.lapsed.length}</div>
          <div className="stat-delta neg">need re-engagement</div>
        </div>
      </div>

      {/* Data mining: revenue + popular */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-pad">
            <div className="row row-between" style={{ marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}><Icons.Chart size={14} /> Revenue by service</h3>
              <span className="muted" style={{ fontSize: 12 }}>All time</span>
            </div>
            <div className="bars">
              {sortedRev.map(([sid, rev]) => {
                const s = SVC_BY_ID[sid];
                if (!s) return null;
                return (
                  <div key={sid} className="bar-row">
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${rev/maxRev*100}%` }} /></div>
                    <span className="bar-val">{fmtMoney(rev)}</span>
                  </div>
                );
              })}
            </div>
            <hr className="sep" />
            <div className="row row-between">
              <span className="muted" style={{ fontSize: 13 }}>Total lifetime revenue</span>
              <span className="strong num" style={{ fontFamily: 'Fraunces, serif', fontSize: 22 }}>{fmtMoney(data.totalRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad">
            <div className="row row-between" style={{ marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}><Icons.Sparkle size={14} /> Most popular services</h3>
              <span className="muted" style={{ fontSize: 12 }}>By bookings</span>
            </div>
            <div className="bars">
              {sortedCount.map(([sid, count]) => {
                const s = SVC_BY_ID[sid];
                if (!s) return null;
                return (
                  <div key={sid} className="bar-row">
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${count/maxCount*100}%`, background: 'linear-gradient(90deg, var(--rose), var(--accent))' }} /></div>
                    <span className="bar-val">{count} ×</span>
                  </div>
                );
              })}
            </div>
            <hr className="sep" />
            <div className="row row-between">
              <span className="muted" style={{ fontSize: 13 }}>Total bookings</span>
              <span className="strong num" style={{ fontFamily: 'Fraunces, serif', fontSize: 22 }}>{data.allVisits.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent + Lapsed */}
      <div className="grid-asym" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-pad">
            <div className="row row-between" style={{ marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}><Icons.Clock size={14} /> Recent visits</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => go('search')}>View all <Icons.ArrowRight size={12} /></button>
            </div>
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>When</th>
                    <th>Services</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map(v => (
                    <tr key={v.id} onClick={() => openCustomer(v.customerId)}>
                      <td className="primary">
                        <div className="row" style={{ gap: 10 }}>
                          <Avatar name={v.customerName} size="sm" />
                          {v.customerName}
                        </div>
                      </td>
                      <td>
                        <div>{fmtDateShort(v.date)}</div>
                        <div className="sub">{v.time}</div>
                      </td>
                      <td><ServiceTags ids={v.services} /></td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>{fmtMoney(v.price)}</td>
                      <td><StarRating value={v.rating} readOnly size={13} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad">
            <div className="row row-between" style={{ marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}><Icons.Bell size={14} /> Re-engage</h3>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              Customers you haven't seen in over 90 days. A friendly check-in often brings them back.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.lapsed.length === 0 && (
                <div className="empty" style={{ padding: '24px 0' }}>
                  <Icons.Sparkle className="empty-ico" size={32} />
                  <div style={{ fontSize: 13 }}>No lapsed customers — great work!</div>
                </div>
              )}
              {data.lapsed.slice(0, 6).map(c => (
                <div key={c.id}
                  onClick={() => openCustomer(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, cursor: 'pointer', border: '1px solid var(--line)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={c.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{daysSince(c.lastVisit)} days · {c.phone}</div>
                  </div>
                  <Icons.Phone size={14} style={{ color: 'var(--ink-3)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageDashboard = PageDashboard;
