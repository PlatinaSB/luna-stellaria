# Luna Tools

<p align="center">
  <img src="./static/logo.svg" alt="luna tools logo" width="128">
</p>

A growing collection of small browser tools, built with [SvelteKit](https://kit.svelte.dev/) and Svelte 5, styled with Tailwind CSS and [shadcn-svelte](https://www.shadcn-svelte.com/).

Website: [Luna tools](https://tools.luna-stellaria.com)

## Tools

### AI

- **IndoBERT AI Text Classification** — detects generative AI text in Indonesian using a hosted endpoint.

### Image

- **Convert Image** — converts images between JPEG, PNG, and WebP.
- **Compress Image** — reduces image file size (via [compressorjs](https://www.npmjs.com/package/compressorjs)).

### Playing Card

- **24 Card Game** — solves 24 card puzzles.

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
