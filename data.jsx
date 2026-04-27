// data.jsx — services, seed customers, helpers, store

const SERVICES = [
  { id: 'areola',   name: 'Areola',    duration: 90, price: 680, icon: 'ServiceAreola',   desc: 'Permanent makeup' },
  { id: 'vio',      name: 'VIO',       duration: 60, price: 280, icon: 'ServiceVio',      desc: 'Intimate area' },
  { id: 'lip',      name: 'Lip',       duration: 75, price: 580, icon: 'ServiceLip',      desc: 'Lip blush / tint' },
  { id: 'underarm', name: 'Underarm',  duration: 30, price: 120, icon: 'ServiceUnderarm', desc: 'Hair removal' },
  { id: 'legs',     name: 'Legs',      duration: 60, price: 220, icon: 'ServiceLegs',     desc: 'Hair removal' },
  { id: 'others',   name: 'Others',    duration: 30, price: 0,   icon: 'ServiceOther',    desc: 'Custom service' },
];
const SVC_BY_ID = Object.fromEntries(SERVICES.map(s => [s.id, s]));

const fmtMoney = (n) => '$' + (n || 0).toLocaleString('en-SG', { minimumFractionDigits: 0 });
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateShort = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short' });
};
const fmtTime = (t) => t || '—';
const initials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase();
const daysSince = (iso) => {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
};

// ── Seed data ─────────────────────────────────────────────────
const today = new Date();
const dOff = (n) => {
  const d = new Date(today); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
};

const seedCustomers = [
  {
    id: 'c1', name: 'Tan Mei Ling', phone: '9123 4567', notes: 'Prefers morning slots. Sensitive to lidocaine.',
    createdAt: dOff(220),
    visits: [
      { id:'v1', date: dOff(2),   time:'10:30', services:['lip'],     price:580, comment:'Touch-up perfect; healed evenly.', feedback:5, rating:5, checkup:'2 weeks', photos:2 },
      { id:'v2', date: dOff(45),  time:'11:00', services:['lip'],     price:580, comment:'Initial session; mild swelling, normal.', feedback:5, rating:5, checkup:'4 weeks', photos:3 },
      { id:'v3', date: dOff(120), time:'14:00', services:['underarm','legs'], price:340, comment:'First time. Tolerated well.', feedback:4, rating:4, checkup:'', photos:0 },
    ]
  },
  {
    id: 'c2', name: 'Priya Sharma', phone: '8876 5432', notes: 'Allergy: nickel. Prefers Sat afternoons.',
    createdAt: dOff(180),
    visits: [
      { id:'v4', date: dOff(7),  time:'15:00', services:['areola'],  price:680, comment:'Post-mastectomy reconstruction. Very pleased.', feedback:5, rating:5, checkup:'6 weeks', photos:4 },
      { id:'v5', date: dOff(95), time:'15:00', services:['vio'],     price:280, comment:'Routine session.', feedback:4, rating:4, checkup:'', photos:0 },
    ]
  },
  {
    id: 'c3', name: 'Rachel Lim', phone: '9088 1122', notes: '',
    createdAt: dOff(80),
    visits: [
      { id:'v6', date: dOff(14), time:'13:00', services:['vio','underarm'], price:400, comment:'', feedback:4, rating:4, checkup:'', photos:0 },
      { id:'v7', date: dOff(42), time:'13:00', services:['vio'],            price:280, comment:'', feedback:5, rating:5, checkup:'', photos:0 },
    ]
  },
  {
    id: 'c4', name: 'Nurul Aina',  phone: '8123 0099', notes: 'Newborn — flexible scheduling.',
    createdAt: dOff(40),
    visits: [
      { id:'v8', date: dOff(5),  time:'09:30', services:['lip'], price:580, comment:'Soft pink shade chosen.', feedback:5, rating:5, checkup:'4 weeks', photos:2 },
    ]
  },
  {
    id: 'c5', name: 'Catherine Wong', phone: '9234 5566', notes: 'VIP. Refer-a-friend bonus active.',
    createdAt: dOff(360),
    visits: [
      { id:'v9',  date: dOff(20),  time:'16:00', services:['areola','lip'],   price:1260, comment:'Combo session. Excellent retention.', feedback:5, rating:5, checkup:'6 weeks', photos:6 },
      { id:'v10', date: dOff(110), time:'16:00', services:['legs'],            price:220, comment:'',  feedback:5, rating:5, checkup:'', photos:0 },
      { id:'v11', date: dOff(200), time:'16:00', services:['underarm','legs'], price:340, comment:'',  feedback:4, rating:4, checkup:'', photos:0 },
      { id:'v12', date: dOff(300), time:'16:00', services:['vio'],             price:280, comment:'',  feedback:5, rating:5, checkup:'', photos:0 },
    ]
  },
  {
    id: 'c6', name: 'Sofia Reyes', phone: '8765 4321', notes: '',
    createdAt: dOff(150),
    visits: [
      { id:'v13', date: dOff(150), time:'11:30', services:['underarm'], price:120, comment:'One-off trial.', feedback:3, rating:3, checkup:'', photos:0 },
    ]
  },
  {
    id: 'c7', name: 'Jasmine Koh', phone: '9456 7788', notes: 'Ask about colour fade after 6mo.',
    createdAt: dOff(60),
    visits: [
      { id:'v14', date: dOff(3),  time:'14:30', services:['lip'],   price:580, comment:'Top-up only.', feedback:5, rating:5, checkup:'8 weeks', photos:1 },
      { id:'v15', date: dOff(60), time:'14:30', services:['lip'],   price:580, comment:'Initial.',     feedback:5, rating:5, checkup:'4 weeks', photos:2 },
    ]
  },
  {
    id: 'c8', name: 'Linda Goh', phone: '9011 2233', notes: '',
    createdAt: dOff(28),
    visits: [
      { id:'v16', date: dOff(1),  time:'10:00', services:['vio','underarm','legs'], price:520, comment:'Combined package.', feedback:5, rating:5, checkup:'', photos:0 },
    ]
  },
];

// derive: latest visit, total spend, visit count
function enrich(cust) {
  const visits = [...cust.visits].sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));
  const lastVisit = visits[0]?.date || null;
  const totalSpend = visits.reduce((s,v)=>s + (v.price||0), 0);
  const avgRating = visits.length ? (visits.reduce((s,v)=>s + (v.rating||0), 0) / visits.length) : 0;
  return { ...cust, visits, lastVisit, totalSpend, visitCount: visits.length, avgRating };
}

// ── Store using localStorage ──────────────────────────────────
const STORE_KEY = 'asy_beaute_crm_v1';
function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { customers: seedCustomers };
}
function saveStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
}
function resetStore() {
  saveStore({ customers: seedCustomers });
}

window.SERVICES = SERVICES;
window.SVC_BY_ID = SVC_BY_ID;
window.fmtMoney = fmtMoney;
window.fmtDate = fmtDate;
window.fmtDateShort = fmtDateShort;
window.fmtTime = fmtTime;
window.initials = initials;
window.daysSince = daysSince;
window.enrich = enrich;
window.loadStore = loadStore;
window.saveStore = saveStore;
window.resetStore = resetStore;
