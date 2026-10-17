# Luna Stellaria

<p align="center">
  <img src="./static/logo.svg" alt="Luna Stellaria logo" width="128">
</p>

A growing collection of small browser tools, built with [SvelteKit](https://kit.svelte.dev/) and Svelte 5, styled with Tailwind CSS and [shadcn-svelte](https://www.shadcn-svelte.com/).

Website: [Luna Stellaria](https://luna-stellaria.com)

> This repository is the **frontend only**. Accounts, sessions, the D1 database, and the Hugging Face
> endpoint all live in the companion API, [`luna-stellaria-api`](../luna-stellaria-api) (served at
> `https://api.luna-stellaria.com`). The browser talks to the API directly over credentialed CORS.

## Tools

Full public list lives in [`src/lib/seo.ts`](src/lib/seo.ts) (`publicTools`) and navigation groups in [`src/lib/menu-list/index.ts`](src/lib/menu-list/index.ts).

| Route                              | Tool                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `/convert`                         | Convert images between JPEG, PNG, WebP                        |
| `/compress`                        | Compress images in-browser (compressorjs)                     |
| `/qrcode-generator`                | QR code generator (PNG/JPEG/WebP, custom error correction)    |
| `/24cardgame`                      | 24 card game solver                                           |
| `/indobert-ai-text-classification` | Indonesian AI text detection via the `luna-stellaria-api` API |
| `/login`, `/register`              | Account auth (forms call the API)                             |
| `/account`                         | Account settings: name, email, password (call the API)        |

## Project Structure

```
src/routes/<tool>/+page.svelte  One route per tool
src/routes/login|register/      Auth forms (client-side, call the API with a Turnstile token)
src/routes/account/             Account settings (client-side, calls the API)
src/routes/+layout.server.ts    Auth state from the API + host redirect
src/lib/api.ts                  API base URL resolution (apiBaseUrl)
src/lib/seo.ts                  Site metadata, public tool list, canonical URLs
src/lib/components/seo.svelte   Drop-in <head> meta component
src/lib/components/turnstile.svelte  Cloudflare Turnstile widget (login/register)
src/lib/menu-list/              Navigation menu data
src/lib/components/ui/          shadcn-svelte components
src/service-worker/index.ts     PWA precache service worker
wrangler.jsonc                  Worker config (domain route, static assets)
```

## Architecture

- **Client-only tools** — convert/compress/QR/24-card game run entirely in the browser; no uploads.
- **AI text classification** — the page calls `POST /ai/indobert/classify` on the API, which proxies the hosted Hugging Face endpoint. The API holds the endpoint URL and key.
- **Auth** — the login/register form pages `fetch` the API directly with `credentials: 'include'`. The API issues the session as an httpOnly `jwt` cookie scoped to `.luna-stellaria.com`, so it is sent on both frontend and API requests. `+layout.server.ts` forwards the cookie to the API's `GET /auth/me` to render auth state; the frontend never verifies the JWT itself.
- **API base URL** — [`src/lib/api.ts`](src/lib/api.ts) resolves the API origin: `localhost`/`127.0.0.1` → `http://localhost:8787`, everything else → `https://api.luna-stellaria.com`. Server-side callers pass the request hostname explicitly.
- **Host redirect** — `+layout.server.ts` serves the canonical domain. `tools.luna-stellaria.com` redirects to `luna-stellaria.com` with `307`, and other unknown hostnames (e.g. `*.workers.dev`) with `308`, preserving path + query. Localhost and `*.luna-stellaria.com` are allowed through.
- **SEO** — each page renders `<Seo title=... description=... path=... jsonLd=... />`; canonical/OG/Twitter tags generated from `SITE` in `src/lib/seo.ts`.

## Adding a New Tool

1. Create `src/routes/<slug>/+page.svelte` with the tool UI and a `<Seo>` component.
2. Add the tool to `imageTools` / `cardTools` / `aiTools` in `src/lib/menu-list/index.ts` (navigation).
3. Add it to `publicTools` in `src/lib/seo.ts` (sitemap/listing metadata).
4. It is client-side first; call the API (`apiBaseUrl()`) for anything that needs server secrets, the database, or auth.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) 2 + [Svelte](https://svelte.dev/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4 with `@tailwindcss/vite`
- [shadcn-svelte](https://www.shadcn-svelte.com/) component library
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) via `@sveltejs/adapter-cloudflare`

Auth, the D1 database, and the Hugging Face endpoint live in [`luna-stellaria-api`](../luna-stellaria-api).

## Getting Started

### Prerequisites

- Node.js 20+
- The [`luna-stellaria-api`](../luna-stellaria-api) project running locally on `http://localhost:8787` (for login/register and the AI text classifier)

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Start the API alongside it (`cd ../luna-stellaria-api && npm run dev`) so auth and the AI classifier
work. The Turnstile site key for the login/register widget is read at runtime via
`$env/dynamic/public`: `.env` locally (template in `.env.example`), `wrangler.jsonc` `vars` in
production — it is public by design, not a secret; all secrets live in the API project.

## Scripts

| Script            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Start the dev server                                            |
| `npm run build`   | Generate Cloudflare types and build for production              |
| `npm run preview` | Preview the production build locally with `wrangler dev`        |
| `npm run check`   | Type-check with `svelte-check`                                  |
| `npm run lint`    | Run Prettier and ESLint                                         |
| `npm run format`  | Format code with Prettier                                       |
| `npm run gen`     | Regenerate Cloudflare bindings types                            |
| `npm run deploy`  | Generate types, format, build, and deploy to Cloudflare Workers |

## Deployment

This project uses the [Cloudflare adapter](https://kit.svelte.dev/docs/adapter-cloudflare) and deploys to Workers with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm run deploy
```

The frontend has no secrets or database bindings. Deploy the API (`luna-stellaria-api`) separately so
`https://api.luna-stellaria.com` is reachable.

### Custom Domain

The Worker is bound to the apex domain via the `routes` entry in [`wrangler.jsonc`](wrangler.jsonc):

```jsonc
"routes": [
	{
		"pattern": "luna-stellaria.com",
		"custom_domain": true
	}
]
```

With `custom_domain: true`, Wrangler creates the DNS record and certificate for the domain on deploy, so `https://luna-stellaria.com` is served directly by the Worker. The domain's zone must live in the same Cloudflare account as the Worker; otherwise `wrangler deploy` fails. `workers_dev` and `preview_urls` remain enabled, and requests on those hostnames are redirected to the canonical domain by `src/routes/+layout.server.ts`.
