# AGENTS.md

Guidance for AI coding agents working in **Luna Stellaria** — a collection of small browser tools.

You are a lazy senior developer here too: client-first, fewest files, shortest diff. This is a personal tools site, not an enterprise app — no abstraction layers, no premature config.

**This repository is the frontend only.** Accounts, sessions, the D1 database, and the Hugging Face
endpoint live in the companion API project, [`luna-stellaria-api`](../luna-stellaria-api), served at
`https://api.luna-stellaria.com`. The browser calls the API directly with credentialed CORS.

## Stack

- SvelteKit 2 + Svelte 5 (runes mode is **forced** for all project files — see `svelte.config.js`)
- TypeScript (strict), Vite 8
- Tailwind CSS 4 via `@tailwindcss/vite` + shadcn-svelte / bits-ui components
- Cloudflare Workers via `@sveltejs/adapter-cloudflare`, Wrangler
- Auth and AI: delegated to `luna-stellaria-api` (no JWT/bcrypt/D1 code lives here)

## Commands

| Command           | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server                                                     |
| `npm run build`   | `wrangler types --check` + `vite build`                             |
| `npm run preview` | Preview the built Worker locally (`wrangler dev`)                   |
| `npm run check`   | Generate types + `svelte-kit sync` + `svelte-check` (type checking) |
| `npm run lint`    | `prettier --check .` + `eslint .`                                   |
| `npm run format`  | `prettier --write .`                                                |
| `npm run gen`     | Regenerate `worker-configuration.d.ts` (`wrangler types`)           |
| `npm run deploy`  | gen + format + build + `wrangler deploy`                            |

- Run `npm run check` and `npm run lint` before finishing a change; run `npm run format` after editing any file Prettier touches (`.prettierignore` excludes `package-lock.json` and `/static/` only).
- Never hand-edit `worker-configuration.d.ts` or anything in `.svelte-kit/` — both are generated. If a Cloudflare binding type is missing, run `npm run gen`.
- `npm run check` runs `wrangler types --check` first — if `wrangler.jsonc` is malformed, it fails before `svelte-check` runs, so fix `wrangler.jsonc` first.

## Code style

- Prettier config is authoritative (`.prettierrc`): **tabs**, single quotes, **no trailing commas**, print width 100.
- `prettier-plugin-tailwindcss` sorts Tailwind classes automatically — never reorder classes by hand, just run `npm run format`.
- Svelte files use runes (`$state`, `$derived`, `$props`, `$effect`); do not use legacy `export let` / reactive `$:`.
- Components use `interface Props { ... }` + `let { ... }: Props = $props()` (see `src/lib/components/seo.svelte`
  for the house pattern).
- Prefer the existing `$lib/components/ui/*` shadcn-svelte primitives over new bespoke components.
- Import aliases: `$lib`, `$app/*`, `$env/*`, `$service-worker`.
- Programmatic navigation must go through `resolve()` from `$app/paths` (ESLint enforces
  `svelte/no-navigation-without-resolve`): `goto(resolve('/login'))`.

## Architecture

- `src/routes/<slug>/+page.svelte` — one route per tool. Tools are **client-first**; there are no
  `+page.server.ts` route files. Anything needing server secrets, the database, or auth calls the API
  through `apiBaseUrl()` from `src/lib/api.ts`.
- `src/lib/api.ts` — resolves the API origin: `localhost`/`127.0.0.1` → `http://localhost:8787`,
  `<branch>.preview.luna-stellaria.com` → the parallel API preview `https://<branch>.preview-api.luna-stellaria.com`,
  otherwise `https://api.luna-stellaria.com`; an explicit `PUBLIC_API_URL` var overrides all of it.
  Server-side callers pass `url.hostname` explicitly.
- `src/lib/seo.ts` — `SITE` metadata, `publicTools` list (sitemap/listing), `absoluteUrl()`.
- `src/lib/components/seo.svelte` — drop-in `<Seo />` component; usual props:
  - `title` (required, appended with ` | Luna Stellaria` unless `suffix={false}`)
  - `description` (defaults to `SITE.defaultDescription`), `path` (canonical path), `image`, `type`, `noindex`
  - `jsonLd?: Record<string, unknown> | Record<string, unknown>[]` — emitted as `application/ld+json`
- `src/routes/sitemap.xml/+server.ts` — prerendered sitemap built from `publicTools` plus the home page; a tool is included automatically once registered there.
- `src/lib/menu-list/index.ts` — navigation groups (`imageTools`, `cardTools`, `aiTools`), used by the header/nav in `src/routes/+layout.svelte`.
- `src/routes/+layout.server.ts` — enforces the host redirect (canonical `luna-stellaria.com`;
  `tools.luna-stellaria.com` gets `307`, other unknown hosts get `308`, preserving path + query;
  localhost and `*.luna-stellaria.com` are allowed through) and forwards the `jwt` cookie to the API's
  `GET /auth/me` to expose `user` to the layout. Route anything that might run on a non-canonical host
  through this file — don't bypass it.
- `src/service-worker/index.ts` — PWA precache service worker.
- `wrangler.jsonc` — Worker name, custom domain route, static assets, and the public
  `PUBLIC_Turnstile_site_key` var. No D1 binding, no secrets. Run `npm run gen` after changing it.

### Auth pattern (reference)

There is no server-side auth code here — it all lives in the API. From the frontend:

- Login/register pages `fetch(`${apiBaseUrl()}/auth/login|register`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: ... })`. Both require a
  `turnstile_token` in the body (login, register, and the IndoBERT classifier), taken from the
  `<Turnstile>` widget (`src/lib/components/turnstile.svelte`,
  site key from the `PUBLIC_Turnstile_site_key` env var); bump its `resetSignal` after failed submissions
  because tokens are single-use.
- On success, call `invalidateAll()` (to refresh the layout's `data.user`) then `goto(resolve('/'))`.
- Logout (`src/routes/+layout.svelte`) posts to `/auth/logout` with `credentials: 'include'`, then `invalidateAll()` + `goto(resolve('/login'))`.
- Account settings (`/account`) post to `/auth/account/name|email|password` the same way; email and
  password changes require `current_password` and an email change reissues the session cookie.
- The session is an httpOnly `jwt` cookie scoped to `.luna-stellaria.com` by the API. The frontend
  reads auth state only via `data.user`, which comes from the API's `/auth/me` in `+layout.server.ts`.
- Surface API errors from the JSON envelope (`body.error.message`); the API returns
  `{ success: false, error: { code, message } }`.

## Adding a new tool

1. Create `src/routes/<slug>/+page.svelte` with the UI and a `<Seo>` component.
2. Register it in `src/lib/menu-list/index.ts` (appropriate group).
3. Add it to `publicTools` in `src/lib/seo.ts` (this feeds the sitemap and public listing).
4. Call the API via `apiBaseUrl()` if the tool needs secrets, the database, or auth.

## Environment & deployment

- Three environments, all under `luna-stellaria.com`:
  - **development** — `npm run dev` (vite) / `npm run preview` (local built worker). Config comes from `.env` (template in `.env.example`).
  - **preview** — `npx wrangler preview` deploys an isolated copy per branch, served on the preview-only
    wildcard `*.preview.luna-stellaria.com` (route with `previews_enabled: true, enabled: false`). Preview
    vars/secrets/bindings live in the `previews` block of `wrangler.jsonc` (Cloudflare Worker Previews,
    Wrangler 4.135+). Requires Wrangler to have deployed top-level config at least once.
  - **production** — `npm run deploy` to `luna-stellaria.com`; vars at the top level of `wrangler.jsonc`.
- **Only public env config lives in this project** (`ENVIRONMENT`, `PUBLIC_Turnstile_site_key`,
  `PUBLIC_API_URL`) read via `$env/dynamic/public` or platform bindings. Never put secrets here: all
  secrets (`JWT_SECRET`, `Turnstile_secret_key`, `hf_endpoints`, `hf_endpoints_key`) and the `lunadb` D1
  binding belong to `luna-stellaria-api`.
- `apiBaseUrl()` maps each frontend host to its API: localhost → local API, `*.preview.luna-stellaria.com`
  → parallel `*.preview-api.luna-stellaria.com`, anything else → `https://api.luna-stellaria.com`;
  `PUBLIC_API_URL` overrides.
- Namespace types are declared in `src/app.d.ts`; the generated `Env` mirrors `wrangler.jsonc` `vars` —
  run `npm run gen` after changing it.
- The Worker is bound to `luna-stellaria.com` via `routes` (`custom_domain: true`); the zone must be in
  the same Cloudflare account or `wrangler deploy` fails. Protect `*.preview.luna-stellaria.com` with
  Cloudflare Access (no automatic `noindex` there). Keep `README.md` and this file in sync when adding
  tools, scripts, or changing deployment/domain behavior.

## Keep in mind

- **Canonical host matters**: every request outside `luna-stellaria.com` (except allowed dev/api hosts) gets a redirect. Never hardcode `workers.dev` or preview URLs in shipped code; absolute URLs must go through `absoluteUrl()` / `SITE.url`.
- **SEO parity**: a tool page missing `<Seo>` or `publicTools` registration is invisible to the sitemap and canonical layout.
- **Generated files**: `worker-configuration.d.ts`, `.svelte-kit/`, and `build/` outputs are disposable — regenerate, don't hand-edit.
- **temp.sql** at the repo root is scratch SQL — don't include it in commits.
- **Don't move backend logic here**: if a change needs D1, JWT, bcrypt, or the Hugging Face key, it belongs in `luna-stellaria-api`, not in this repo.
