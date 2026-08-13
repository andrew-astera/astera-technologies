# ASTERA Technologies — ASTERA.CG

Corporate website for **ASTERA Technologies**, built as a Node.js/Express app serving a static front end (HTML/CSS/JS) with a working contact-form API.

## Stack

- **Backend:** Node.js + Express — serves static files, exposes `/api/contact`
- **Frontend:** vanilla HTML, CSS, JS (no framework, no build step)
- **Storage:** flat JSON file (`data/messages.json`) — swap for a real DB in production

## Project structure

```
astera-site/
├── server.js              # Express app + API routes
├── package.json
├── data/
│   └── messages.json      # contact form submissions (auto-created at runtime)
└── public/
    ├── index.html          # single-page site: hero, about, capabilities,
    │                       # approach, work, contact
    ├── css/
    │   └── style.css       # full design system (tokens, layout, components)
    └── js/
        └── main.js         # constellation canvas, nav toggle, form handling
```

## Run locally

```bash
npm install
npm start
```

Site runs at **http://localhost:3000**

For auto-restart during development:

```bash
npx nodemon server.js
```

## API

### `POST /api/contact`

Accepts a contact form submission and persists it to `data/messages.json`.

**Request body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Example Corp",
  "message": "We'd like to talk about a project."
}
```

`name`, `email`, and `message` are required; `company` is optional. Returns `400` with an `error` message on invalid input, `200` with `{ ok: true, message }` on success.

### `GET /api/health`

Simple liveness check — returns `{ ok: true, service, time }`.

## Design notes

The visual identity is built around the company name's root (*Astera* → star, astronomy) rather than a generic tech-company look:

- **Palette:** deep navy background, brass/gold accent (astrolabe-style instrument color), muted starlight-blue for connecting lines — deliberately not the default cream/terracotta or near-black/neon combos.
- **Type:** Fraunces (display), Inter (body), IBM Plex Mono (data/coordinates).
- **Signature element:** an animated constellation canvas in the hero (`public/js/main.js`) — stars connect into a live network graph, echoing both "Astera" (stars) and the tech/network subject matter, and responds to pointer movement.
- **Section labels** use star-chart-style coordinates (e.g. `RA 09h12m`) instead of generic numbered markers.

## Content to customize before launch

- `public/index.html` — replace placeholder stats, selected-work case studies, and contact email (`hello@astera.cg`) with real details.
- `public/index.html` `<head>` — update `<title>` / meta description if the value proposition changes.
- Swap `data/messages.json` for a proper database or email-delivery service (e.g. SES, SendGrid) before production use — a flat file is fine for a first deploy but won't scale or survive a redeploy on most hosts.

## Deployment

Any Node host works (Render, Railway, Fly.io, a VPS, etc.). Set the `PORT` environment variable if your host requires it — `server.js` already reads `process.env.PORT`.
