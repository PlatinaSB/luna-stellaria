# Luna Stellaria

<p align="center">
  <img src="./static/logo.svg" alt="Luna Stellaria logo" width="128">
</p>

A growing collection of small browser tools, built with [SvelteKit](https://kit.svelte.dev/) and Svelte 5, styled with Tailwind CSS and [shadcn-svelte](https://www.shadcn-svelte.com/).

Website: [Luna Stellaria](https://luna-stellaria.com)

## Tools

Full public list lives in [`src/lib/seo.ts`](src/lib/seo.ts) (`publicTools`) and navigation groups in [`src/lib/menu-list/index.ts`](src/lib/menu-list/index.ts).

| Route                              | Tool                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `/convert`                         | Convert images between JPEG, PNG, WebP                        |
| `/compress`                        | Compress images in-browser (compressorjs)                     |
| `/qrcode-generator`                | QR code generator (PNG/JPEG/WebP, custom error correction)    |
| `/24cardgame`                      | 24 card game solver                                           |
| `/indobert-ai-text-classification` | Indonesian AI text detection via hosted Hugging Face endpoint |
| `/login`, `/register`              | Account auth (JWT cookie)                                     |

## Project Structure

```
migrations/                     D1 SQL migrations
src/routes/<tool>/+page.svelte  One route per tool
src/routes/login|register/      Auth forms + form actions (+page.server.ts)
src/routes/+layout.server.ts    Auth session + host redirect
src/lib/seo.ts                  Site metadata, public tool list, canonical URLs
src/lib/components/seo.svelte   Drop-in <head> meta component
src/lib/menu-list/              Navigation menu data
src/lib/components/ui/          shadcn-svelte components
src/service-worker/index.ts     PWA precache service worker
wrangler.jsonc                  Worker config (domain routes, D1 binding)
```

## Architecture

- **Client-only tools** — convert/compress/QR/24-card game run entirely in the browser; no uploads.
- **AI text classification** — the page calls the hosted Hugging Face endpoint configured via `hf_endpoints` / `hf_endpoints_key`.
- **Auth** — form actions in `login/+page.server.ts` and `register/+page.server.ts` read/write D1 via the `lunadb` binding, hash passwords with `bcryptjs` (cost 12), and set a 7-day HS256 JWT in an httpOnly `jwt` cookie (`jose`). `+layout.server.ts` verifies the cookie on every request and exposes `user` to the layout.
- **Host redirect** — the layout server load serves the canonical domain `luna-stellaria.com` and redirects other deployment hostnames (e.g. `tools.luna-stellaria.com`, `*.workers.dev`) to it with `308`, preserving path + query. Localhost and `*.luna-stellaria.com` are allowed through.
- **SEO** — each page renders `<Seo title=... description=... path=... jsonLd=... />`; canonical/OG/Twitter tags generated from `SITE` in `src/lib/seo.ts`.

## Adding a New Tool

1. Create `src/routes/<slug>/+page.svelte` with the tool UI and a `<Seo>` component.
2. Add the tool to `imageTools` / `cardTools` / `aiTools` in `src/lib/menu-list/index.ts` (navigation).
3. Add it to `publicTools` in `src/lib/seo.ts` (sitemap/listing metadata).
4. It is client-side first; only add server code (`+page.server.ts`) if the tool needs secrets or D1.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) 2 + [Svelte](https://svelte.dev/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4 with `@tailwindcss/vite`
- [shadcn-svelte](https://www.shadcn-svelte.com/) component library
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) via `@sveltejs/adapter-cloudflare`
- [Cloudflare D1](https://developers.cloudflare.com/d1/) database (users table)
- JWT auth (`jose`) + `bcryptjs` password hashing

## Getting Started

### Prerequisites

- Node.js 20+
- A [Cloudflare account](https://dash.cloudflare.com/) with a D1 database named `lunadb`

### Install

```bash
npm install
```

### Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```
hf_endpoints = 'HF endpoints link here'
hf_endpoints_key = 'HF tokens here'
JWT_SECRET = 'JWT Secret here'
```

### Run Locally

```bash
npm run dev
```

### Database

Apply the auth migration to your linked D1 database:

```bash
npx wrangler d1 migrations apply lunadb --local   # local dev
npx wrangler d1 migrations apply lunadb --remote  # production
```

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

Set `JWT_SECRET`, `hf_endpoints`, and `hf_endpoints_key` as [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/) in production.

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
