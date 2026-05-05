# Trakt Up Next — Stremio Addon

A Stremio addon that shows unwatched released episodes from Trakt, sorted by latest air date. Includes a setup page for Trakt OAuth and personal addon URL generation.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally

Required env vars: `TRAKT_CLIENT_ID`, `TRAKT_CLIENT_SECRET`, `SESSION_SECRET`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (schema empty — no DB needed for this addon)
- **Build**: esbuild (CJS bundle)

## Where things live

- `artifacts/setup/` — React Vite setup page (served at `/`)
- `artifacts/api-server/src/routes/trakt.ts` — Trakt OAuth flow (`/api/trakt/auth`, `/api/trakt/callback`)
- `artifacts/api-server/src/routes/stremio.ts` — Stremio addon endpoints (`/api/stremio/:token/...`)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (only healthz defined; Stremio/Trakt routes are custom)

## Architecture decisions

- Trakt access token is base64url-encoded directly into the Stremio addon URL path — no server-side token storage needed, stateless design
- Stremio catalog fetches up to 80 watched shows in parallel, filters out future/unaired episodes, sorts by most recently aired
- OAuth callback redirects to `/?addon=<url>` so the setup React page can display the install instructions
- Redirect URI is inferred from `REPLIT_DOMAINS` env var (set by Replit) so it works in both dev and production

## Product

- Setup page at `/` — user connects their Trakt account via OAuth
- After auth, user gets a personal addon URL and step-by-step Stremio install instructions
- Addon manifest at `/api/stremio/:token/manifest.json`
- Addon catalog at `/api/stremio/:token/catalog/series/trakt-upnext.json`

## Gotchas

- The Trakt redirect URI registered in your Trakt app must match exactly: `https://<domain>/api/trakt/callback`
- No DB is used — tokens live only in the user's addon URL
- Stremio requires CORS headers on all addon endpoints (already set)

## User preferences

_Populate as you build_

## Pointers

- Trakt API docs: https://trakt.docs.apiary.io/
- Stremio addon SDK docs: https://github.com/Stremio/stremio-addon-sdk
