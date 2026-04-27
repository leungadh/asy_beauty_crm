// page-dashboard.jsx — Overview + data mining

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

    // ── Analytics 1: Monthly revenue (last 12 months) ──────────────────────
    const monthlyRevMap = {};
    allVisits.forEach(v => {
      const m = v.date.slice(0,7); // YYYY-MM
      monthlyRevMap[m] = (monthlyRevMap[m] || 0) + v.price;
    });
    const monthlyRev = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = d.toISOString().slice(0,7);
      const label = d.toLocaleDateString('en-SG', { month: 'short', year: '2-digit' });
      return { key, label, value: monthlyRevMap[key] || 0 };
    });

    // ── Analytics 2: Retention — first-visit cohorts ───────────────────────
    const cohortMap = {};
    customers.forEach(c => {
      if (!c.visits.length) return;
      const sorted = [...c.visits].sort((a,b) => a.date.localeCompare(b.date));
      const firstDate = new Date(sorted[0].date);
      const cohort = sorted[0].date.slice(0,7);
      if (!cohortMap[cohort]) cohortMap[cohort] = { total: 0, ret60: 0, ret90: 0 };
      cohortMap[cohort].total++;
      const hasReturn = sorted.slice(1).some(v => {
        const diff = (new Date(v.date) - firstDate) / 86400000;
        return diff > 14; // exclude same-period re-visit
      });
      const ret60 = sorted.slice(1).some(v => {
        const diff = (new Date(v.date) - firstDate) / 86400000;
        return diff > 14 && diff <= 60;
      });
      const ret90 = sorted.slice(1).some(v => {
        const diff = (new Date(v.date) - firstDate) / 86400000;
        return diff > 14 && diff <= 90;
      });
      if (ret60) cohortMap[cohort].ret60++;
      if (ret90) cohortMap[cohort].ret90++;
    });
    const retention = Object.entries(cohortMap)
      .sort((a,b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([month, d]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-SG', { month: 'short', year: '2-digit' }),
        total: d.total,
        pct60: d.total ? Math.round(d.ret60 / d.total * 100) : 0,
        pct90: d.total ? Math.round(d.ret90 / d.total * 100) : 0,
      }));

    // ── Analytics 3: Service bundle pairs ─────────────────────────────────
    const pairCounts = {};
    allVisits.forEach(v => {
      if (v.services.length < 2) return;
      for (let i = 0; i < v.services.length; i++) {
        for (let j = i + 1; j < v.services.length; j++) {
          const key = [v.services[i], v.services[j]].sort().join('+');
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    });
    const topPairs = Object.entries(pairCounts)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [a, b] = key.split('+');
        return { label: `${SVC_BY_ID[a]?.name || a} + ${SVC_BY_ID[b]?.name || b}`, count };
      });

    // ── Analytics 4: Peak visit heatmap (day × time-of-day) ───────────────
    const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const SLOTS = ['Morning','Noon','Afternoon','Evening'];
    const slotOf = (t) => {
      const h = parseInt((t || '00:00').split(':')[0]);
      if (h < 12) return 0;
      if (h < 14) return 1;
      if (h < 17) return 2;
      return 3;
    };
    const heatmap = Array.from({ length: 7 }, () => Array(4).fill(0));
    allVisits.forEach(v => {
      const dow = new Date(v.date).getDay();
      heatmap[dow][slotOf(v.time)]++;
    });
    const heatMax = Math.max(1, ...heatmap.flat());

    // ── Analytics 5: LTV segmentation ─────────────────────────────────────
    const ltv = { high: { count: 0, rev: 0 }, mid: { count: 0, rev: 0 }, low: { count: 0, rev: 0 } };
    customers.forEach(c => {
      const tier = c.totalSpend >= LTV_HIGH ? 'high' : c.totalSpend >= LTV_MID ? 'mid' : 'low';
      ltv[tier].count++;
      ltv[tier].rev += c.totalSpend;
    });

    return {
      customers, allVisits, last30, prev30,
      revByService, countByService,
      totalRevenue, rev30, revPrev, revDelta,
      lapsed, newThisMonth, recent,
      monthlyRev,
      retention,
      topPairs,
      heatmap, heatMax,
      DAYS, SLOTS,
      ltv,
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

      {/* ── Analytics row ── */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Monthly Revenue Trend */}
        <div className="card">
          <div className="card-pad">
            <div className="row row-between" style={{ marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}><Icons.Chart size={14} /> Monthly revenue</h3>
              <span className="muted" style={{ fontSize: 12 }}>Last 12 months</span>
            </div>
            <div style={{ display: 'flex', align: 'flex-end', gap: 6, height: 80, alignItems: 'flex-end' }}>
              {data.monthlyRev.map(m => {
                const maxVal = Math.max(1, ...data.monthlyRev.map(x => x.value));
                const pct = m.value / maxVal * 100;
                return (
                  <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${pct}%`, minHeight: m.value ? 4 : 0, background: 'linear-gradient(180deg, var(--accent), var(--accent-ink))', borderRadius: '4px 4px 0 0', transition: 'height 500ms' }} title={fmtMoney(m.value)} />
                    <span style={{ fontSize: 9, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Retention cohorts */}
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title" style={{ marginBottom: 14 }}><Icons.TrendUp size={14} /> Return-visit retention</h3>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>% of new customers who returned within 60 / 90 days</div>
              {data.retention.length === 0 ? (
                <div className="muted" style={{ fontSize: 13, padding: '8px 0' }}>Not enough data yet.</div>
              ) : (
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', paddingBottom: 8 }}>Cohort</th>
                      <th style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', paddingBottom: 8 }}>New</th>
                      <th style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', paddingBottom: 8 }}>60d</th>
                      <th style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', paddingBottom: 8 }}>90d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.retention.map(r => (
                      <tr key={r.month}>
                        <td style={{ paddingBottom: 6, color: 'var(--ink-2)', fontWeight: 500 }}>{r.label}</td>
                        <td style={{ textAlign: 'center', paddingBottom: 6 }}>{r.total}</td>
                        <td style={{ textAlign: 'center', paddingBottom: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: r.pct60 >= 50 ? 'var(--good-soft)' : 'var(--rose-soft)',
                            color: r.pct60 >= 50 ? 'var(--good)' : 'var(--rose)' }}>
                            {r.pct60}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', paddingBottom: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: r.pct90 >= 60 ? 'var(--good-soft)' : 'var(--rose-soft)',
                            color: r.pct90 >= 60 ? 'var(--good)' : 'var(--rose)' }}>
                            {r.pct90}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Service bundles */}
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title" style={{ marginBottom: 14 }}><Icons.Sparkle size={14} /> Popular combos</h3>
              <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Services most frequently booked together</div>
              {data.topPairs.length === 0 ? (
                <div className="muted" style={{ fontSize: 13 }}>No multi-service visits yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.topPairs.map((p, i) => (
                    <div key={i} className="row row-between" style={{ fontSize: 13.5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i+1}</span>
                        {p.label}
                      </span>
                      <span className="pill pill-accent">{p.count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Heatmap */}
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title" style={{ marginBottom: 14 }}><Icons.Clock size={14} /> Peak visit times</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', gap: 4, fontSize: 11 }}>
                <div />
                {data.DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600 }}>{d}</div>
                ))}
                {data.SLOTS.map((slot, si) => (
                  <React.Fragment key={slot}>
                    <div style={{ color: 'var(--ink-3)', fontWeight: 500, paddingTop: 6, fontSize: 10.5 }}>{slot}</div>
                    {data.DAYS.map((_, di) => {
                      const val = data.heatmap[di][si];
                      const opacity = val / data.heatMax;
                      return (
                        <div key={di} title={`${val} visit${val !== 1 ? 's' : ''}`}
                          style={{ height: 28, borderRadius: 6, background: `rgba(37,99,235,${opacity.toFixed(2)})`,
                            border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
                            color: opacity > 0.5 ? '#fff' : 'var(--ink-4)', fontWeight: 600, fontSize: 11 }}>
                          {val > 0 ? val : ''}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* LTV segmentation */}
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title" style={{ marginBottom: 14 }}><Icons.Money size={14} /> Customer value tiers</h3>
              <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                High &gt;{fmtMoney(LTV_HIGH)} · Mid {fmtMoney(LTV_MID)}–{fmtMoney(LTV_HIGH)} · Low &lt;{fmtMoney(LTV_MID)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'High value', key: 'high', color: 'var(--good)', bg: 'var(--good-soft)' },
                  { label: 'Mid value',  key: 'mid',  color: 'var(--warn)', bg: '#fef3cd' },
                  { label: 'Low value',  key: 'low',  color: 'var(--ink-3)', bg: 'var(--surface-2)' },
                ].map(tier => {
                  const d = data.ltv[tier.key];
                  return (
                    <div key={tier.key} style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: tier.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: tier.color, fontSize: 13 }}>{tier.label}</div>
                        <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>{d.count} customer{d.count !== 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: tier.color, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoney(d.rev)}
                      </div>
                    </div>
                  );
                })}
              </div>
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
