# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step. Open `CRM.html` directly in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/CRM.html
```

React 18, ReactDOM, and Babel are loaded from CDN (pinned SRI hashes in `CRM.html`). All `.jsx` files are transpiled in-browser at runtime via `<script type="text/babel">`.

There are no tests, no linter, and no package.json.

## Architecture

### Global-variable module system

There is no bundler. Each `.jsx` file is a self-contained script that reads globals set by earlier scripts and exports its own symbols onto `window`. The load order in `CRM.html` is therefore significant:

```
tweaks-panel.jsx  → window.{useTweaks, TweaksPanel, TweakSection, TweakRadio, …}
icons.jsx         → window.Icons  (object of SVG components)
data.jsx          → window.{SERVICES, SVC_BY_ID, fmtMoney, fmtDate, fmtDateShort,
                             fmtTime, initials, daysSince, enrich,
                             loadStore, saveStore, resetStore}
components.jsx    → window.{StarRating, ServiceButton, useToast, Sidebar,
                             MobileNav, ServiceTags, Avatar}
page-*.jsx        → window.{PageDashboard, PageNewVisit, PageSearch, PageCustomer}
app.jsx           → mounts <App /> into #root
```

Never import between files — add new symbols to `window` and consume from `window`.

### Data layer

All state lives in `localStorage` under key `asy_beaute_crm_v1` as JSON `{ customers: [...] }`. There is no backend. `data.jsx` owns the store shape, seed data, and helpers (`loadStore` / `saveStore` / `resetStore`). The `enrich()` helper derives `lastVisit`, `totalSpend`, `visitCount`, and `avgRating` from the raw visit array — always call it before displaying customer data.

### Routing

`app.jsx` owns a single `route` state string (`'dashboard' | 'new' | 'search' | 'customer'`) plus a `customerId` for the customer detail page. Navigation is done by calling `go(routeName)` or `openCustomer(id)`. There is no URL router.

### Styling

All CSS is in `CRM.html` inside a single `<style>` block. The design system is CSS custom properties on `:root` (surfaces, ink scale, accent, semantic colours, spacing tokens). Three colour themes (`blue` / `rose` / `sage`) and three density/radius variants are applied by setting `data-variant`, `data-density`, and `data-radius` attributes on `<body>` — the TweaksPanel floater does this at runtime.

### TweaksPanel

`tweaks-panel.jsx` is a reusable prototype-tooling component. It listens for `postMessage` events (`__activate_edit_mode` / `__deactivate_edit_mode`) and exposes a draggable floating panel. The `TWEAK_DEFAULTS` object in `app.jsx` is delimited by `/*EDITMODE-BEGIN*/` … `/*EDITMODE-END*/` comments so an external host can rewrite defaults on disk.

### Adding a new page

1. Create `page-yourpage.jsx`, define the component, assign `window.PageYourPage = PageYourPage` at the bottom.
2. Add `<script type="text/babel" src="page-yourpage.jsx"></script>` in `CRM.html` before `app.jsx`.
3. Add the route string to `app.jsx`'s `route` state and render the page in the `if/else` chain.
4. Add a nav item in `Sidebar` and `MobileNav` inside `components.jsx`.

### Adding a new service

Edit the `SERVICES` array in `data.jsx`. Add a matching icon component in `icons.jsx` using the same name as the `icon` field. Seed visits in `seedCustomers` if needed for demos.
