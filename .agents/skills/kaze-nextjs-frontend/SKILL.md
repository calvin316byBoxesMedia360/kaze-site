---
name: kaze-nextjs-frontend
description: Project-local Next.js frontend workflow for Kaze. Use when modifying the Kaze Next.js site, routes, components, metadata, public assets, smooth navigation, or build behavior in kaze-web, especially for Version 1 and /technical.
---

# Kaze Next.js Frontend

Work inside `kaze-web/` unless the user explicitly asks for root-level documentation or static legacy files.

## Workflow

1. Read `kaze-web/AGENTS.md` before Next.js changes.
2. Keep Version 1 at `/` intact unless the user asks to merge or replace it.
3. Treat `/technical` as the parallel Kaze Technical Edition route.
4. Put Next-served assets in `kaze-web/public/`, not the repository root `public/`.
5. Run `npm run build` in `kaze-web/` after code or CSS changes.
6. Verify local URLs with HTTP checks or browser review:
   - `http://127.0.0.1:3000/`
   - `http://127.0.0.1:3000/technical`

## Local Design Rules

- Preserve smooth anchor navigation and clear section IDs.
- Prefer small, focused components over large page rewrites.
- Use real Kaze imagery when it improves trust and clarity.
- Keep CSS scoped to the route when testing alternate visual directions.
- Avoid adding dependencies unless they clearly reduce complexity.
