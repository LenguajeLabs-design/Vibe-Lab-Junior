# Vibe Lab Junior

A creative coding toy that lets children ages 9–11 describe, play, safely revise, and explicitly save tiny browser projects on the current device.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/vibe-lab-junior run dev` — run the web artifact through its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret for live generation: `MODEL_API_KEY`
- Optional env: `DEMO_MODE=true` forces deterministic sample projects

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Persistence: no server storage; users can explicitly save projects locally on the current device
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/vibe-lab-junior` — child-facing React/Vite application
- `artifacts/api-server/src/projects` — prompts, provider client, demos, and safety checks
- `artifacts/api-server/src/routes/projects.ts` — generation route and rate limit
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Generated projects are data, never files written into server source.
- Unsafe project code is rejected server-side and contained again by iframe sandbox + CSP.
- Provider errors fall back to deterministic projects so the child keeps a working experience.
- No database or authentication is used in the MVP.

## Product

- Create a tiny playable project from one idea.
- Add, change, or fix one thing at a time while preserving the accepted project on failure.
- Read short learning notes and optionally inspect the generated code.
- Save and reopen projects locally on the current device without an account.
- Start over without storing personal information or project history.

## User preferences

- Build and preview incrementally in Replit.
- Keep GitHub as the source-of-truth repository and commit working checkpoints.
- Use this conversation for architecture, security, debugging, and UI review.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run API codegen before using generated types or hooks.
- Do not weaken the iframe sandbox or CSP without a separate security review.
- Do not log child prompts, full model responses, or secrets.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
