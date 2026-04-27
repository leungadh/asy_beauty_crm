// page-customer.jsx — Customer detail with full visit history

const { useState: useStateC, useMemo: useMemoC } = React;

function PageCustomer({ store, setStore, customerId, go, showToast }) {
  const cust = useMemoC(() => {
    const raw = store.customers.find(c => c.id === customerId);
    return raw ? enrich(raw) : null;
  }, [store.customers, customerId]);

  const [editing, setEditing] = useStateC(false);
  const [name, setName] = useStateC(cust?.name || '');
  const [phone, setPhone] = useStateC(cust?.phone || '');
  const [notes, setNotes] = useStateC(cust?.notes || '');

  if (!cust) return (
    <div className="content">
      <div className="empty card">
        <Icons.User className="empty-ico" size={40} />
        <div className="strong">Customer not found</div>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => go('search')}>Back to customers</button>
      </div>
    </div>
  );

  const days = daysSince(cust.lastVisit);
  const serviceCounts = {};
  cust.visits.forEach(v => v.services.forEach(s => serviceCounts[s] = (serviceCounts[s]||0) + 1));
  const topServices = Object.entries(serviceCounts).sort((a,b) => b[1]-a[1]).slice(0,3);

  async function saveEdits() {
    try {
      await upsertCustomer({ ...cust, name: name.trim(), phone: phone.trim(), notes: notes.trim() });
      setStore(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === cust.id
          ? { ...c, name: name.trim(), phone: phone.trim(), notes: notes.trim() }
          : c)
      }));
      setEditing(false);
      showToast('Customer updated');
    } catch {
      showToast('Failed to update — please check your connection.');
    }
  }
  function startEdit() {
    setName(cust.name); setPhone(cust.phone); setNotes(cust.notes || '');
    setEditing(true);
  }

  async function handleDeleteCustomer() {
    if (!confirm(`Permanently delete ${cust.name} and all ${cust.visitCount} visit${cust.visitCount !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    try {
      await deleteCustomer(cust.id);
      setStore(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== cust.id) }));
      showToast(`${cust.name} deleted`);
      go('search');
    } catch {
      showToast('Failed to delete — please check your connection.');
    }
  }

  async function handleDeleteVisit(visitId, visitDate) {
    if (!confirm(`Remove the visit on ${fmtDate(visitDate)}? This cannot be undone.`)) return;
    try {
      await deleteVisit(visitId);
      setStore(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === cust.id
          ? { ...c, visits: c.visits.filter(v => v.id !== visitId) }
          : c)
      }));
      showToast('Visit removed');
    } catch {
      showToast('Failed to remove visit — please check your connection.');
    }
  }

  return (
    <div className="content">
      <div className="crumbs" style={{ marginBottom: 16 }}>
        <span style={{ cursor:'pointer' }} onClick={() => go('search')}>Customers</span>
        <span className="sep">/</span>
        <span className="here">{cust.name}</span>
      </div>

      <div className="card">
        <div className="cust-hero">
          <Avatar name={cust.name} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
                <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes / preferences" />
              </div>
            ) : (
              <>
                <h1 className="cust-name">{cust.name}</h1>
                <div className="cust-meta-row">
                  <span className="row"><Icons.Phone size={14} /> <span className="num">{cust.phone}</span></span>
                  <span className="row"><Icons.Calendar size={14} /> Customer since {fmtDate(cust.createdAt)}</span>
                  {days != null && <span className="row"><Icons.Clock size={14} /> Last visit {days}d ago</span>}
                </div>
                {cust.notes && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--accent-soft)', borderRadius: 10, color: 'var(--accent-ink)', fontSize: 13.5, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icons.Note size={14} style={{ flex: '0 0 14px', marginTop: 2 }} />
                    <span>{cust.notes}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="row" style={{ flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
            {editing ? (
              <>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdits}>Save</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm" onClick={startEdit}><Icons.Edit size={14} /> Edit</button>
                <button className="btn btn-primary btn-sm" onClick={() => go('new')}><Icons.Plus size={14} /> New visit</button>
                <button className="btn btn-sm"
                  style={{ color: 'var(--bad)', borderColor: 'var(--bad)', background: 'transparent' }}
                  onClick={handleDeleteCustomer}>
                  <Icons.X size={14} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid-4" style={{ marginTop: 16 }}>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Calendar size={14} /> Total visits</div>
          <div className="stat-value">{cust.visitCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Money size={14} /> Lifetime value</div>
          <div className="stat-value">{fmtMoney(cust.totalSpend)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Star size={14} /> Avg. rating</div>
          <div className="stat-value">{cust.avgRating ? cust.avgRating.toFixed(1) : '—'}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><Icons.Sparkle size={14} /> Top service</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {topServices[0] ? SVC_BY_ID[topServices[0][0]]?.name : '—'}
          </div>
        </div>
      </div>

      {/* Visit history */}
      <div className="grid-asym" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-pad">
            <h3 className="section-title"><Icons.Clock size={14} /> Visit history</h3>
            {cust.visits.length === 0 && (
              <div className="empty" style={{ padding: '32px 0' }}>
                <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>No visits recorded yet.</div>
              </div>
            )}
            <div className="timeline">
              {cust.visits.map(v => (
                <div key={v.id} className="tl-item">
                  <div className="tl-date row row-between">
                    <span>{fmtDate(v.date)} · {v.time}</span>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Remove this visit"
                      style={{ color: 'var(--ink-4)', marginLeft: 8 }}
                      onClick={() => handleDeleteVisit(v.id, v.date)}>
                      <Icons.X size={13} />
                    </button>
                  </div>
                  <div className="tl-card">
                    <div className="row row-between" style={{ marginBottom: 8 }}>
                      <ServiceTags ids={v.services} />
                      <span className="strong num">{fmtMoney(v.price)}</span>
                    </div>
                    {v.rating > 0 && (
                      <div className="row" style={{ marginBottom: 8, fontSize: 13 }}>
                        <StarRating value={v.rating} readOnly size={14} />
                      </div>
                    )}
                    {v.feedback && (
                      <div style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
                        <span className="muted" style={{ fontSize: 11, display: 'block', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Customer feedback</span>
                        <span style={{ fontStyle: 'italic' }}>"{v.feedback}"</span>
                      </div>
                    )}
                    {v.comment && (
                      <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', borderRadius: 8, fontSize: 13, color: 'var(--accent-ink)', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, display: 'block', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', opacity: 0.8 }}>Your note</span>
                        {v.comment}
                      </div>
                    )}
                    <div className="row" style={{ gap: 14, fontSize: 12, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                      {v.checkup && <span className="row" style={{ gap: 4 }}><Icons.Bell size={12} /> Check-up: {v.checkup}</span>}
                      {v.photos > 0 && <span className="row" style={{ gap: 4 }}><Icons.Camera size={12} /> {v.photos} photos</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title">Services breakdown</h3>
              <div className="bars">
                {topServices.map(([sid, count]) => {
                  const max = topServices[0][1];
                  return (
                    <div key={sid} className="bar-row">
                      <span style={{ fontWeight: 500 }}>{SVC_BY_ID[sid]?.name}</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${count/max*100}%` }} /></div>
                      <span className="bar-val">{count}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-pad">
              <h3 className="section-title">Quick actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn"><Icons.Phone size={14} /> Call {cust.phone}</button>
                <button className="btn"><Icons.Bell size={14} /> Set reminder</button>
                <button className="btn"><Icons.Download size={14} /> Export history</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageCustomer = PageCustomer;
