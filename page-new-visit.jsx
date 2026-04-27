// page-new-visit.jsx — Record a new visit / customer

const { useState: useStateNV, useEffect: useEffectNV, useMemo: useMemoNV } = React;

function PageNewVisit({ store, setStore, go, showToast }) {
  // mode: 'existing' or 'new'
  const [mode, setMode] = useStateNV('new');
  const [selectedCustomerId, setSelectedCustomerId] = useStateNV(null);

  // form state
  const [name, setName] = useStateNV('');
  const [phone, setPhone] = useStateNV('');
  const [notes, setNotes] = useStateNV('');

  const todayISO = new Date().toISOString().slice(0,10);
  const nowHHMM = new Date().toTimeString().slice(0,5);
  const [date, setDate] = useStateNV(todayISO);
  const [time, setTime] = useStateNV(nowHHMM);
  const [services, setServices] = useStateNV([]);
  const [customPrice, setCustomPrice] = useStateNV('');
  const [comment, setComment] = useStateNV('');
  const [feedback, setFeedback] = useStateNV('');
  const [rating, setRating] = useStateNV(0);
  const [checkup, setCheckup] = useStateNV('');
  const [photos, setPhotos] = useStateNV(0);

  // customer search dropdown
  const [custQuery, setCustQuery] = useStateNV('');
  const matches = useMemoNV(() => {
    if (!custQuery.trim()) return store.customers.slice(0, 6);
    const q = custQuery.toLowerCase();
    return store.customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g,'').includes(q.replace(/\s/g,''))
    ).slice(0, 8);
  }, [custQuery, store.customers]);

  const computedPrice = useMemoNV(() => {
    let total = services.reduce((s, id) => s + (SVC_BY_ID[id]?.price || 0), 0);
    if (customPrice !== '') total = parseFloat(customPrice) || 0;
    return total;
  }, [services, customPrice]);

  const totalDuration = useMemoNV(() =>
    services.reduce((s, id) => s + (SVC_BY_ID[id]?.duration || 0), 0)
  , [services]);

  function pickCustomer(c) {
    setSelectedCustomerId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setNotes(c.notes || '');
    setMode('existing');
    setCustQuery('');
  }

  function clearCustomer() {
    setSelectedCustomerId(null);
    setName(''); setPhone(''); setNotes('');
    setMode('new');
  }

  function toggleService(id) {
    setServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setCustomPrice(''); // re-derive price
  }

  const [saving, setSaving] = useStateNV(false);

  function canSave() {
    return name.trim() && phone.trim() && services.length > 0 && date && time;
  }

  async function handleSave() {
    if (!canSave() || saving) return;
    setSaving(true);

    const visitId = 'v' + Date.now();
    const visit = {
      id: visitId,
      date, time,
      services: [...services],
      price: computedPrice,
      comment: comment.trim(),
      feedback: feedback.trim(),
      rating,
      checkup,
      photos: parseInt(photos) || 0,
    };

    // Determine customer (selected, or matched by phone, or new)
    let custId = selectedCustomerId;
    let custObj;
    const existingIdx = store.customers.findIndex(c =>
      c.id === selectedCustomerId ||
      c.phone.replace(/\s/g,'') === phone.replace(/\s/g,'')
    );
    if (existingIdx >= 0) {
      const existing = store.customers[existingIdx];
      custId = existing.id;
      custObj = { ...existing, name: name.trim(), phone: phone.trim(), notes: notes.trim() || existing.notes };
    } else {
      custId = 'c' + Date.now();
      custObj = { id: custId, name: name.trim(), phone: phone.trim(), notes: notes.trim(), createdAt: todayISO };
    }

    try {
      await upsertCustomer(custObj);
      await upsertVisit({ ...visit, customer_id: custId });

      setStore(prev => {
        const customers = [...prev.customers];
        const idx = customers.findIndex(c => c.id === custId);
        if (idx < 0) {
          customers.push({ ...custObj, visits: [visit] });
        } else {
          customers[idx] = { ...customers[idx], ...custObj, visits: [...customers[idx].visits, visit] };
        }
        return { ...prev, customers };
      });

      showToast('Visit recorded successfully');
      setSelectedCustomerId(null);
      setName(''); setPhone(''); setNotes('');
      setServices([]); setCustomPrice('');
      setComment(''); setFeedback(''); setRating(0); setCheckup(''); setPhotos(0);
      setDate(todayISO); setTime(new Date().toTimeString().slice(0,5));
      setMode('new');
      setTimeout(() => go('search'), 800);
    } catch {
      showToast('Failed to save — please check your connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Record <em>a visit</em></h1>
          <div className="page-sub">Capture customer details, services performed, and your notes — all in one place.</div>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => go('search')}>Cancel</button>
          <button className={`btn btn-primary btn-lg`} disabled={!canSave() || saving} onClick={handleSave}
            style={{ opacity: canSave() && !saving ? 1 : 0.5, cursor: canSave() && !saving ? 'pointer' : 'not-allowed' }}>
            <Icons.Check size={16} strokeWidth={2.5} />
            {saving ? 'Saving…' : 'Save visit'}
          </button>
        </div>
      </div>

      <div className="grid-asym">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* CUSTOMER */}
          <div className="card">
            <div className="form-section">
              <div className="row row-between" style={{ marginBottom: 14 }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  <Icons.User size={14} /> Customer
                </h3>
                {selectedCustomerId && (
                  <button className="btn btn-ghost btn-sm" onClick={clearCustomer}>
                    <Icons.X size={14} /> Clear
                  </button>
                )}
              </div>

              {!selectedCustomerId && (
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Find existing customer</label>
                  <div className="input-icon" style={{ position: 'relative' }}>
                    <Icons.Search className="ico" size={16} />
                    <input className="input" placeholder="Search by name or phone…"
                      value={custQuery} onChange={e => setCustQuery(e.target.value)} />
                  </div>
                  {custQuery.trim() && matches.length > 0 && (
                    <div className="card" style={{ marginTop: 6, padding: 4, maxHeight: 240, overflowY: 'auto' }}>
                      {matches.map(c => (
                        <div key={c.id}
                          onClick={() => pickCustomer(c)}
                          style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Avatar name={c.name} size="sm" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{c.phone} · {c.visits.length} visits</div>
                          </div>
                          <Icons.ArrowRight size={14} style={{ color: 'var(--ink-4)' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="help">Or fill in below to create a new customer.</div>
                </div>
              )}

              {selectedCustomerId && (
                <div style={{ padding: '10px 12px', background: 'var(--accent-soft)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Icons.Check size={14} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
                  <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Existing customer selected</span>
                </div>
              )}

              <div className="grid-2">
                <div>
                  <label className="label">Full name <span className="req">*</span></label>
                  <input className="input" placeholder="e.g. Tan Mei Ling" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone number <span className="req">*</span></label>
                  <input className="input" placeholder="9123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="label">Notes / preferences</label>
                <textarea className="textarea" placeholder="Allergies, sensitivities, preferred times, anything to remember…"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* SERVICES */}
          <div className="card">
            <div className="form-section">
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                <Icons.Sparkle size={14} /> Services performed
              </h3>
              <div className="svc-grid">
                {SERVICES.map(s => (
                  <ServiceButton key={s.id} service={s} on={services.includes(s.id)} onClick={() => toggleService(s.id)} />
                ))}
              </div>
              {services.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div className="row" style={{ gap: 16, fontSize: 13 }}>
                    <span><span className="muted">Total time:</span> <span className="strong num">{totalDuration} min</span></span>
                    <span><span className="muted">Default price:</span> <span className="strong num">{fmtMoney(services.reduce((s,id) => s + (SVC_BY_ID[id]?.price || 0), 0))}</span></span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="label" style={{ margin: 0 }}>Override price:</span>
                    <input className="input num" style={{ width: 110, textAlign: 'right' }}
                      placeholder="—" value={customPrice}
                      onChange={e => setCustomPrice(e.target.value.replace(/[^0-9.]/g,''))} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DATE / TIME */}
          <div className="card">
            <div className="form-section">
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                <Icons.Calendar size={14} /> Date &amp; time
              </h3>
              <div className="grid-3">
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div>
                  <label className="label">Follow-up check-up</label>
                  <select className="select" value={checkup} onChange={e => setCheckup(e.target.value)}>
                    <option value="">Not needed</option>
                    <option value="1 week">In 1 week</option>
                    <option value="2 weeks">In 2 weeks</option>
                    <option value="4 weeks">In 4 weeks</option>
                    <option value="6 weeks">In 6 weeks</option>
                    <option value="8 weeks">In 8 weeks</option>
                    <option value="3 months">In 3 months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* FEEDBACK + COMMENT */}
          <div className="card">
            <div className="form-section">
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                <Icons.Star size={14} /> Customer feedback
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <span className="label" style={{ margin: 0 }}>Rating</span>
                <StarRating value={rating} onChange={setRating} size={26} />
                {rating > 0 && <span className="muted" style={{ fontSize: 13 }}>({rating}/5)</span>}
              </div>
              <label className="label">Customer's words</label>
              <textarea className="textarea" placeholder="What did the customer say about the experience?"
                value={feedback} onChange={e => setFeedback(e.target.value)} />
            </div>
            <div className="form-section">
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                <Icons.Note size={14} /> Your private comment
              </h3>
              <textarea className="textarea" placeholder="Notes only you will see — technique, healing, anything to remember for next time…"
                value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <div className="form-section">
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                <Icons.Camera size={14} /> Before / after photos
              </h3>
              <div className="photo-grid">
                {[0,1,2,3].map(i => (
                  <div key={i} className="photo-ph" style={{ cursor: 'pointer' }} onClick={() => setPhotos(Math.min(4, photos + 1))}>
                    {i < photos ? <Icons.Check size={20} style={{ color: 'var(--accent)' }} /> :
                      <span>+ upload<br/>photo {i+1}</span>}
                  </div>
                ))}
              </div>
              <div className="help">Tap to mark photos as captured (placeholder — real upload in next iteration).</div>
            </div>
          </div>
        </div>

        {/* SUMMARY SIDEBAR */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 90 }}>
            <div className="card-pad">
              <h3 className="section-title">Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SumRow label="Customer" value={name || <span className="muted">— not set —</span>} />
                <SumRow label="Phone" value={phone || <span className="muted">—</span>} />
                <SumRow label="Date" value={fmtDate(date)} />
                <SumRow label="Time" value={time || '—'} />
                <SumRow label="Services" value={
                  services.length ? <ServiceTags ids={services} /> : <span className="muted">— none —</span>
                } />
                <SumRow label="Duration" value={totalDuration ? `${totalDuration} min` : '—'} />
                <SumRow label="Rating" value={rating ? <StarRating value={rating} readOnly size={14} /> : <span className="muted">—</span>} />
                <hr className="sep" style={{ margin: '6px 0' }} />
                <div className="row row-between">
                  <span className="strong">Total</span>
                  <span className="strong num" style={{ fontFamily: 'Fraunces, serif', fontSize: 22 }}>{fmtMoney(computedPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SumRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, fontSize: 13.5 }}>
      <span style={{ color: 'var(--ink-3)', flex: '0 0 80px' }}>{label}</span>
      <span style={{ color: 'var(--ink)', textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

window.PageNewVisit = PageNewVisit;
