// icons.jsx — minimal stroke icon set (Lucide-inspired)
// All take className/size; default size 18.
const Ico = ({ children, size = 18, className = '', strokeWidth = 1.75, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
    {children}
  </svg>
);

const Icons = {
  Home: (p) => <Ico {...p}><path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/></Ico>,
  Plus: (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  Search: (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ico>,
  Users: (p) => <Ico {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21c0-2.7-1.6-5-3.9-6.1"/></Ico>,
  Chart: (p) => <Ico {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-7"/></Ico>,
  Settings: (p) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ico>,
  Calendar: (p) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Ico>,
  Clock: (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ico>,
  Phone: (p) => <Ico {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></Ico>,
  Mail: (p) => <Ico {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/></Ico>,
  User: (p) => <Ico {...p}><circle cx="12" cy="8" r="4"/><path d="M3 21c0-4.4 4-8 9-8s9 3.6 9 8"/></Ico>,
  Check: (p) => <Ico {...p}><path d="M5 12l5 5L20 7"/></Ico>,
  X: (p) => <Ico {...p}><path d="M6 6l12 12M18 6 6 18"/></Ico>,
  Camera: (p) => <Ico {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Ico>,
  Star: (p) => <Ico {...p}><path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.8L12 17.8l-6.3 3.3L7 14.2 2 9.3l7-1z" fill={p?.fill || 'none'}/></Ico>,
  Note: (p) => <Ico {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></Ico>,
  Money: (p) => <Ico {...p}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></Ico>,
  Sparkle: (p) => <Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Ico>,
  ArrowRight: (p) => <Ico {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Ico>,
  ArrowLeft: (p) => <Ico {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></Ico>,
  ChevronDown: (p) => <Ico {...p}><path d="M6 9l6 6 6-6"/></Ico>,
  Filter: (p) => <Ico {...p}><path d="M22 3H2l8 9.4V19l4 2v-8.6z"/></Ico>,
  Trash: (p) => <Ico {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></Ico>,
  Edit: (p) => <Ico {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4z"/></Ico>,
  Bell: (p) => <Ico {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></Ico>,
  Download: (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Ico>,
  Upload: (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Ico>,
  Logout: (p) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Ico>,
  TrendUp: (p) => <Ico {...p}><path d="m22 7-9 9-4-4-7 7"/><path d="M16 7h6v6"/></Ico>,
  TrendDown: (p) => <Ico {...p}><path d="m22 17-9-9-4 4-7-7"/><path d="M16 17h6v-6"/></Ico>,
  // Service-specific abstract glyphs
  ServiceAreola: (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></Ico>,
  ServiceVio: (p) => <Ico {...p}><path d="M12 3c2 4 5 6 5 10a5 5 0 0 1-10 0c0-4 3-6 5-10z"/></Ico>,
  ServiceLip: (p) => <Ico {...p}><path d="M3 12c2-3 5-4 9-4s7 1 9 4c-2 3-5 5-9 5s-7-2-9-5z"/><path d="M3 12c3-1 6-1 9-1s6 0 9 1"/></Ico>,
  ServiceUnderarm: (p) => <Ico {...p}><path d="M8 3v4l-3 3v11h6v-7h2v7h6V10l-3-3V3"/></Ico>,
  ServiceLegs: (p) => <Ico {...p}><path d="M8 3v8l-2 10h3l1-7 2 7h3l-2-10V3"/></Ico>,
  ServiceOther: (p) => <Ico {...p}><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></Ico>,
};

window.Icons = Icons;
