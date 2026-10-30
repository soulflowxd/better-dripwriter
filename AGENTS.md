# Better Dripwriter agent guidance

@CLAUDE.md

Read [CLAUDE.md](./CLAUDE.md) before editing. It is the source of truth for this repository's structure, branding, licensing, build, checks, packaging, and release steps.

- Work on the browser extension in `src/`; `website/` is an unadapted upstream site. For changes under `website/`, also read [website/AGENTS.md](./website/AGENTS.md).
- Keep the product name **Better Dripwriter** and preserve upstream license and attribution.
- When extension code or assets change, run the checks in `CLAUDE.md` and rebuild the tracked `extension/` folder and both ZIPs with `pnpm package`.
- Keep packaged licenses and notices, version numbers, and generated manifest frame settings in sync as described in `CLAUDE.md`.
- Treat this as a public repository: do not add credentials, and run `pnpm check:secrets` before any push.
- Do not push changes unless the user asks for a push. A local edit or build does not authorize publication.
