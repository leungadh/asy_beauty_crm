// page-search.jsx — Customer search & retrieval

const { useState: useStateS, useMemo: useMemoS } = React;

function PageSearch({ store, go, openCustomer }) {
  const [query, setQuery] = useStateS('');
  const [searchBy, setSearchBy] = useStateS('all'); // all | name | phone
  const [serviceFilter, setServiceFilter] = useStateS([]); // service ids
  const [statusFilter, setStatusFilter] = useStateS('all'); // all | active | lapsed | new
  const [sort, setSort] = useStateS('recent'); // recent | spend | visits | name

  const customers = useMemoS(() => store.customers.map(enrich), [store.customers]);

  const filtered = useMemoS(() => {
    const q = query.trim().toLowerCase();
    let list = customers.filter(c => {
      if (q) {
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.replace(/\s/g,'').includes(q.replace(/\s/g,''));
        if (searchBy === 'name'  && !matchName)  return false;
        if (searchBy === 'phone' && !matchPhone) return false;
        if (searchBy === 'all'   && !matchName && !matchPhone) return false;
      }
      if (serviceFilter.length) {
        const allVisitServices = new Set(c.visits.flatMap(v => v.services));
        if (!serviceFilter.some(s => allVisitServices.has(s))) return false;
      }
      if (statusFilter !== 'all') {
        const days = daysSince(c.lastVisit);
        if (statusFilter === 'active' && (days == null || days > 60))   return false;
        if (statusFilter === 'lapsed' && (days == null || days <= 90))  return false;
        if (statusFilter === 'new'    && c.visitCount > 1)              return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'recent') return (b.lastVisit || '').localeCompare(a.lastVisit || '');
      if (sort === 'spend')  return b.totalSpend - a.totalSpend;
      if (sort === 'visits') return b.visitCount - a.visitCount;
      if (sort === 'name')   return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [customers, query, searchBy, serviceFilter, statusFilter, sort]);

  function toggleSvc(id) {
    setServiceFilter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function clearAll() {
    setQuery(''); setSearchBy('all'); setServiceFilter([]); setStatusFilter('all'); setSort('recent');
  }

  const hasFilters = query || serviceFilter.length || statusFilter !== 'all';

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Find <em>a customer</em></h1>
          <div className="page-sub">Search by name, phone, or service. Click any row to see full history.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => go('new')}>
          <Icons.Plus size={16} strokeWidth={2.5} /> New visit
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-icon" style={{ flex: 1, minWidth: 240 }}>
            <Icons.Search className="ico" size={16} />
            <input className="input" placeholder={
              searchBy === 'phone' ? 'Search phone number…' :
              searchBy === 'name' ? 'Search by customer name…' :
              'Search by name or phone…'
            } value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          </div>
          <div className="row" style={{ background: 'var(--surface-2)', padding: 3, borderRadius: 9, gap: 0 }}>
            {[['all','All'],['name','Name'],['phone','Phone']].map(([id,lbl]) => (
              <button key={id}
                className="btn btn-sm"
                onClick={() => setSearchBy(id)}
                style={{
                  border: 'none',
                  background: searchBy === id ? 'var(--surface)' : 'transparent',
                  boxShadow: searchBy === id ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 500,
                }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="label" style={{ margin: 0, marginRight: 4 }}>Service:</span>
        {SERVICES.map(s => (
          <span key={s.id}
            className={`chip ${serviceFilter.includes(s.id) ? 'on' : ''}`}
            onClick={() => toggleSvc(s.id)}>
            {s.name}
          </span>
        ))}
        <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)', margin: '0 6px' }} />
        <span className="label" style={{ margin: 0, marginRight: 4 }}>Status:</span>
        {[['all','All'],['new','New'],['active','Active'],['lapsed','Lapsed >90d']].map(([id,lbl]) => (
          <span key={id}
            className={`chip ${statusFilter === id ? 'on' : ''}`}
            onClick={() => setStatusFilter(id)}>
            {lbl}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span className="label" style={{ margin: 0 }}>Sort:</span>
        <select className="select" style={{ width: 'auto', height: 32, padding: '0 10px' }}
          value={sort} onChange={e => setSort(e.target.value)}>
          <option value="recent">Most recent</option>
          <option value="spend">Highest spend</option>
          <option value="visits">Most visits</option>
          <option value="name">Name (A–Z)</option>
        </select>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear</button>
        )}
      </div>

      {/* Results count */}
      <div className="row row-between" style={{ marginBottom: 10, padding: '0 4px' }}>
        <span className="muted" style={{ fontSize: 13 }}>
          <span className="strong num">{filtered.length}</span> of {customers.length} customers
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          const data = loadStoreLocal();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = 'asy_crm_export.json'; a.click();
        }}>
          <Icons.Download size={14} /> Export JSON
        </button>
      </div>

      {/* Results table */}
      {filtered.length === 0 ? (
        <div className="card empty">
          <Icons.Search className="empty-ico" size={40} />
          <div style={{ fontWeight: 600, color: 'var(--ink-2)' }}>No customers match your search</div>
          <div style={{ marginTop: 4, fontSize: 13 }}>Try clearing filters or searching by phone instead.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Last visit</th>
                <th>Services</th>
                <th style={{ textAlign: 'right' }}>Visits</th>
                <th style={{ textAlign: 'right' }}>Total spend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const days = daysSince(c.lastVisit);
                const status = days == null ? null
                  : days <= 30 ? { lbl: 'Active',  cls: 'pill-good' }
                  : days <= 90 ? { lbl: 'Recent',  cls: '' }
                  : { lbl: `Lapsed ${days}d`, cls: 'pill-rose' };
                const recentSvcs = [...new Set(c.visits.slice(0,2).flatMap(v => v.services))].slice(0,3);
                return (
                  <tr key={c.id} onClick={() => openCustomer(c.id)}>
                    <td className="primary">
                      <div className="row" style={{ gap: 10 }}>
                        <Avatar name={c.name} size="sm" />
                        <div>
                          <div>{c.name}</div>
                          {c.notes && <div className="sub" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="num">{c.phone}</td>
                    <td>
                      <div>{fmtDateShort(c.lastVisit)}</div>
                      {days != null && <div className="sub">{days}d ago</div>}
                    </td>
                    <td><ServiceTags ids={recentSvcs} /></td>
                    <td className="num" style={{ textAlign: 'right' }}>{c.visitCount}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>{fmtMoney(c.totalSpend)}</td>
                    <td>{status && <span className={`pill ${status.cls}`}><span className="dot" />{status.lbl}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

window.PageSearch = PageSearch;
