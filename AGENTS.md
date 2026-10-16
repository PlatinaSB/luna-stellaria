# AGENTS.md

Guidance for AI coding agents working in the **Luna Stellaria** repo (a collection of small browser tools).

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

Run `npm run check` and `npm run lint` before finishing a change. `worker-configuration.d.ts` and `.svelte-kit/` are generated — do not hand-edit.

## Code style

- Prettier config is authoritative (`.prettierrc`): **tabs**, single quotes, **no trailing commas**, print width 100.
- `prettier-plugin-tailwindcss` sorts Tailwind classes automatically — never reorder classes by hand, just run `npm run format`.
- Svelte files use runes (`$state`, `$derived`, `$props`, `$effect`); do not use legacy `export let` / reactive `$:`.
- Prefer the existing `$lib/components/ui/*` shadcn-svelte primitives over new bespoke components.
- Import aliases: `$lib`, `$app/*`, `$env/*`, `$service-worker`.

## Architecture

- `src/routes/<slug>/+page.svelte` — one route per tool. Tools are client-first; add a `+page.server.ts` only when server secrets or D1 access are needed.
- `src/lib/seo.ts` — `SITE` metadata, `publicTools` list (sitemap/listing), `absoluteUrl()`.
- `src/lib/components/seo.svelte` — drop-in `<Seo title description path jsonLd />` for `<head>` tags.
- `src/lib/menu-list/index.ts` — navigation groups (`imageTools`, `cardTools`, `aiTools`).
- `src/routes/+layout.server.ts` — verifies the `jwt` cookie and exposes `user`; also enforces the host redirect (canonical `luna-stellaria.com`, `308` for other hosts, allows localhost and `*.luna-stellaria.com`).
- `src/service-worker/index.ts` — PWA precache service worker.
- `migrations/*.sql` — D1 migrations (`npx wrangler d1 migrations apply lunadb --local|--remote`).
- `wrangler.jsonc` — Worker name, custom domain route, static assets, `lunadb` D1 binding.

## Adding a new tool

1. Create `src/routes/<slug>/+page.svelte` with the UI and a `<Seo>` component.
2. Register it in `src/lib/menu-list/index.ts` (appropriate group).
3. Add it to `publicTools` in `src/lib/seo.ts`.
4. Only add `+page.server.ts` if the tool needs secrets or D1.

## Environment & deployment

- Copy `.env.example` → `.env`; provide `JWT_SECRET`, `hf_endpoints`, `hf_endpoints_key`.
- Namespace types are declared in `src/app.d.ts`; the Cloudflare env binding is `lunadb` (D1) plus `ASSETS`.
- Production secrets are set as [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/), not committed.
- The Worker is bound to `luna-stellaria.com` through the `routes` entry in `wrangler.jsonc` (`custom_domain: true`). The domain's zone must be in the same Cloudflare account or `wrangler deploy` fails.
- Keep `README.md` in sync when adding tools, scripts, or changing deployment/domain behavior.
