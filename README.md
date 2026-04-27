# ASY Beauté CRM

A lightweight, browser-based CRM built for ASY Beauté — a Singapore beauty salon specialising in permanent makeup and hair removal services.

## Overview

ASY Beauté CRM helps the salon owner track every customer visit in one place: who came in, what services were performed, how much was charged, and how the customer felt about it. Over time it surfaces revenue trends, flags customers who haven't returned in over 90 days, and gives a complete history of every client at a glance.

All data is stored locally in the browser — there is no server, no account, and nothing to install.

## Features

- **Dashboard** — 30-day revenue, visit counts, new customer count, and a lapsed-customer re-engagement list
- **Revenue analytics** — all-time revenue and booking counts broken down by service, rendered as bar charts
- **Visit recording** — log any combination of services with automatic pricing, optional price override, star rating, customer feedback, private notes, follow-up scheduling, and photo count
- **Customer search** — filter by name, phone, service type, or engagement status (new / active / lapsed); sort by most recent, highest spend, most visits, or name
- **Customer profiles** — full visit timeline, lifetime value, average rating, services breakdown, and editable notes
- **Theming** — switchable colour palette (blue / rose / sage), row density, and corner radius via a floating tweaks panel

## Getting started

Open `CRM.html` directly in any modern browser. No installation required.

For accurate relative date calculations, serve the folder over HTTP rather than using `file://`:

```bash
python3 -m http.server 8080
# Open http://localhost:8080/CRM.html
```

The app loads with eight seed customers and sample visits. Use the **Reset demo** button in the top bar to restore the original data at any time.

## Tech stack

| | |
|---|---|
| UI | React 18 (loaded from CDN) |
| Transpilation | Babel Standalone (in-browser, no build step) |
| Persistence | `localStorage` — no backend, no account |
| Fonts | Fraunces (headings), Plus Jakarta Sans (body), JetBrains Mono (numbers) |
| Dependencies | None to install |

## Project structure

```
CRM.html          Entry point — all CSS and script tags
app.jsx           Root component, routing, theme application
data.jsx          Services catalogue, seed data, store helpers (localStorage)
components.jsx    Shared UI components (Avatar, StarRating, Sidebar, etc.)
icons.jsx         SVG icon components
page-dashboard.jsx   Dashboard with KPIs and analytics
page-new-visit.jsx   Visit recording form
page-search.jsx      Customer list with search and filters
page-customer.jsx    Customer detail and visit timeline
tweaks-panel.jsx  Floating design-tweaks panel (colour, density, radius)
```

Scripts are loaded in the order listed above. There is no bundler — each file exports its symbols onto `window` and the next file consumes them.

## Extending

**Adding a new service:** Edit the `SERVICES` array in `data.jsx` (name, duration, price, icon). Add a matching SVG component to `icons.jsx` using the same string as the `icon` field.

**Adding a new page:** Create `page-yourpage.jsx`, assign the component to `window.PageYourPage` at the bottom of the file, add a `<script type="text/babel">` tag in `CRM.html` before `app.jsx`, then wire up the route in `app.jsx` and add a nav entry in `components.jsx`.

See `CLAUDE.md` for the full architectural reference.
