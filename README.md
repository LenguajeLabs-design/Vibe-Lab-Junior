# Vibe Lab Junior

Vibe Lab Junior is a creative coding app for children ages 9–11. A child describes a tiny game or interactive project, plays it in a restricted browser frame, and can ask for one small addition, change, or fix without seeing an IDE.

## Run in Replit

The project uses the Replit pnpm workspace:

- `artifacts/vibe-lab-junior` — React/Vite child-facing app
- `artifacts/api-server` — Express API and server-only model call
- `lib/api-spec/openapi.yaml` — API source of truth

Use the configured Replit workflows:

- **Vibe Lab Junior** for the web preview
- **API Server** for `/api`

## Environment

Add `MODEL_API_KEY` as a Replit Secret. It is read only by the API server.

Optional server environment variables:

- `MODEL_PROVIDER` — `openai` or `anthropic`
- `MODEL_API_URL` — OpenAI-compatible chat completions endpoint
- `MODEL_NAME` — model name; defaults to `gpt-5-mini`
- `ANTHROPIC_WORKSPACE_ID` — required for Anthropic keys that are not scoped to one workspace
- `ALLOWED_ORIGINS` — comma-separated origins allowed to call the API cross-origin in production
- `DEMO_MODE=true` — always use deterministic sample projects

If the key is missing or generation fails, the app keeps working with safe demo projects.

## Useful commands

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/vibe-lab-junior run typecheck
pnpm run typecheck
```

## Safety baseline

- Generated code is treated as untrusted.
- The server validates size, shape, and blocked APIs before returning a project.
- The browser renders accepted code only in `iframe srcdoc` with `sandbox="allow-scripts"`.
- The iframe CSP blocks network requests, external assets, forms, frames, objects, and navigation.
- Prompts and projects are not stored on the server. A child can explicitly save a project in the browser on the current device; no account or database is used.
- The model key is never sent to the browser or included in API responses.
