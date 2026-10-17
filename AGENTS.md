# AGENTS.md

Guidance for AI coding agents working in **Luna Stellaria** — a collection of small browser tools.

You are a lazy senior developer here too: client-first, fewest files, shortest diff. This is a personal tools site, not an enterprise app — no abstraction layers, no premature config.

## Stack

- SvelteKit 2 + Svelte 5 (runes mode is **forced** for all project files — see `svelte.config.js`)
- TypeScript (strict), Vite 8
- Tailwind CSS 4 via `@tailwindcss/vite` + shadcn-svelte / bits-ui components
- Cloudflare Workers via `@sveltejs/adapter-cloudflare`, D1 database, Wrangler
- Auth: `jose` (HS256 JWT in an httpOnly `jwt` cookie) + `bcryptjs`

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

## Architecture

- `src/routes/<slug>/+page.svelte` — one route per tool. Tools are client-first; add a `+page.server.ts` only when server secrets or D1 access are needed.
- `src/lib/seo.ts` — `SITE` metadata, `publicTools` list (sitemap/listing), `absoluteUrl()`.
- `src/lib/components/seo.svelte` — drop-in `<Seo />` component; usual props:
  - `title` (required, appended with ` | Luna Stellaria` unless `suffix={false}`)
  - `description` (defaults to `SITE.defaultDescription`), `path` (canonical path), `image`, `type`, `noindex`
  - `jsonLd?: Record<string, unknown> | Record<string, unknown>[]` — emitted as `application/ld+json`
- `src/routes/sitemap.xml/+server.ts` — prerendered sitemap built from `publicTools` plus the home page; a tool is included automatically once registered there.
- `src/lib/menu-list/index.ts` — navigation groups (`imageTools`, `cardTools`, `aiTools`), used by the header/nav in `src/routes/+layout.svelte`.
- `src/routes/+layout.server.ts` — verifies the `jwt` cookie and exposes `user` to the layout; also enforces
  the host redirect (canonical `luna-stellaria.com` gets `308` from any other host, preserving path + query;
  localhost and `*.luna-stellaria.com` are allowed through). Route anything that might run on a non-canonical
  host through this file — don't bypass it.
- `src/service-worker/index.ts` — PWA precache service worker.
- `migrations/*.sql` — D1 migrations, numbered (`0001_...`, `0002_...`). Commands:

  ```bash
  npx wrangler d1 migrations apply lunadb --local    # local dev
  npx wrangler d1 migrations apply lunadb --remote   # production
  ```

  Never edit an applied migration — add a new numbered file instead. To add a table or column: write the migration SQL, apply it, then update any affected TypeScript types in the codebase.

- `wrangler.jsonc` — Worker name, custom domain route, static assets, `lunadb` D1 binding.

### Auth pattern (reference)

`src/routes/login/+page.server.ts` and `register/+page.server.ts` are the house pattern for server actions with D1:

- `export const actions` takes `{ request, platform, cookies }`; grab the DB via `platform?.env?.lunadb` and hard-fail if missing.
- Validate input → `return fail(400, { error, ...fields })` (never throw for user error — throw only for real server issues).
- Parameterized SQL with `.prepare(...).bind(...)`; passwords hashed/compared with `bcryptjs` (cost 12); sessions are a 7-day HS256 JWT (`jose`) written as an httpOnly `jwt` cookie.
- Read the session in `+layout.server.ts` (`jwtVerify`) and expose `user` to pages via `data.user`.

## Adding a new tool

1. Create `src/routes/<slug>/+page.svelte` with the UI and a `<Seo>` component.
2. Register it in `src/lib/menu-list/index.ts` (appropriate group).
3. Add it to `publicTools` in `src/lib/seo.ts` (this feeds the sitemap and public listing).
4. Only add `+page.server.ts` if the tool needs secrets or D1.

## Environment & deployment

- Copy `.env.example` → `.env`; provide `JWT_SECRET`, `hf_endpoints`, `hf_endpoints_key`.
- Namespace types are declared in `src/app.d.ts`; the Cloudflare env binding is `lunadb` (D1) plus `ASSETS`; server code reads secrets at runtime via `$env/dynamic/private`.
- Production secrets are set as [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/), never committed to the repo.
- The Worker is bound to `luna-stellaria.com` through the `routes` entry in `wrangler.jsonc` (`custom_domain: true`). The domain's zone must be in the same Cloudflare account or `wrangler deploy` fails.
- Keep `README.md` and this file in sync when adding tools, scripts, or changing deployment/domain behavior.

## Keep in mind

- **Canonical host matters**: every request outside `luna-stellaria.com` gets a `308` redirect. Never hardcode `workers.dev` or preview URLs in shipped code; absolute URLs must go through `absoluteUrl()` / `SITE.url`.
- **SEO parity**: a tool page missing `<Seo>` or `publicTools` registration is invisible to the sitemap and canonical layout.
- **Generated files**: `worker-configuration.d.ts`, `.svelte-kit/`, and `build/` outputs are disposable — regenerate, don't hand-edit.
- **temp.sql** at the repo root is scratch SQL — don't include it in migrations or commits.
