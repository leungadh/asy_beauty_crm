# ASY Beauté CRM

A lightweight, browser-based CRM built for ASY Beauté — a Singapore beauty salon specialising in permanent makeup and hair removal services.

## Overview

ASY Beauté CRM helps the salon owner track every customer visit in one place: who came in, what services were performed, how much was charged, and how the customer felt about it. Over time it surfaces revenue trends, flags customers who haven't returned in over 90 days, and gives a complete history of every client at a glance.

Data is stored in Supabase (PostgreSQL). Sign-in is via magic link — no password required. Only pre-registered accounts can sign in.

## Features

- **Dashboard** — 30-day revenue, visit counts, new customer count, and a lapsed-customer re-engagement list
- **Revenue analytics** — all-time revenue and booking counts broken down by service, rendered as bar charts
- **Visit recording** — log any combination of services with automatic pricing, optional price override, star rating, customer feedback, private notes, follow-up scheduling, and photo count
- **Customer search** — filter by name, phone, service type, or engagement status (new / active / lapsed); sort by most recent, highest spend, most visits, or name
- **Customer profiles** — full visit timeline, lifetime value, average rating, services breakdown, and editable notes
- **Theming** — switchable colour palette (blue / rose / sage), row density, and corner radius via a floating tweaks panel

## Getting started

**Live app:** https://asybeaute.netlify.app

Sign in with a magic link — enter your email address and click the link that arrives in your inbox. Only pre-registered accounts can receive a sign-in link.

**Running locally:**

```bash
python3 -m http.server 8080
# Open http://localhost:8080/CRM.html
```

The local app points at the same Supabase backend as the live site, so sign-in is still required. There is no build step — `.jsx` files are transpiled in-browser by Babel.

## Tech stack

| | |
|---|---|
| UI | React 18 (loaded from CDN) |
| Transpilation | Babel Standalone (in-browser, no build step) |
| Auth | Supabase magic link (email allowlist) |
| Persistence | Supabase (PostgreSQL via PostgREST) |
| Hosting | Netlify (static, no build) |
| Fonts | Fraunces (headings), Plus Jakarta Sans (body), JetBrains Mono (numbers) |
| Dependencies | None to install |

## Project structure

```
CRM.html              Entry point — all CSS and script tags
app.jsx               Root component, routing, theme application, auth gate
data.jsx              Services catalogue, Supabase config, auth helpers, store
components.jsx        Shared UI components (Avatar, StarRating, Sidebar, etc.)
icons.jsx             SVG icon components
page-dashboard.jsx    Dashboard with KPIs and analytics
page-new-visit.jsx    Visit recording form
page-search.jsx       Customer list with search, filters, and JSON export
page-customer.jsx     Customer detail and visit timeline
tweaks-panel.jsx      Floating design-tweaks panel (colour, density, radius)
migrate.html          Local-only tool — bulk-imports exported JSON into Supabase
netlify.toml          Netlify hosting config (root rewrite, cache headers)
manifest.webmanifest  PWA manifest
sw.js                 Service worker (caching)
```

Scripts are loaded in the order listed above. There is no bundler — each file exports its symbols onto `window` and the next file consumes them.

## Extending

**Adding a new service:** Edit the `SERVICES` array in `data.jsx` (name, duration, price, icon). Add a matching SVG component to `icons.jsx` using the same string as the `icon` field.

**Adding a new page:** Create `page-yourpage.jsx`, assign the component to `window.PageYourPage` at the bottom of the file, add a `<script type="text/babel">` tag in `CRM.html` before `app.jsx`, then wire up the route in `app.jsx` and add a nav entry in `components.jsx`.

See `CLAUDE.md` for the full architectural reference.
