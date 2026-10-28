# Better Drip Writter

This repository is the user's fork of [Dripwriter Origin](https://github.com/alexey-max-fedorov/dripwriter-origin). Preserve the upstream license and attribution. The active extension is in `src/`; the `website/` directory is an upstream marketing site and is not adapted for this fork.

## Extension

- `src/PopupView.tsx` and `src/popup.css`: popup UI
- `assets/icon.png`: extension icon; Plasmo generates browser sizes from it
- `src/content.ts`: typing control and content script
- `src/lib/harness/`: editor-specific insertion and verification
- `src/background.ts`: focused-frame routing
- `scripts/fix-content-manifest.mjs`: adds frame flags that Plasmo omits from its generated manifests
- `scripts/sync-unpacked.mjs`: refreshes the tracked `extension/` folder after a Chrome build

Use `pnpm exec tsc --noEmit` and `pnpm test` for checks. Use `pnpm package` to rebuild both distributable ZIPs in `build/` and the ready-to-load `extension/` folder. These artifacts are tracked and should be included when extension assets or code change. Confirm the generated manifests still have `all_frames` and `match_about_blank` enabled.

Keep the version in `package.json` and `src/lib/version.ts` synchronized. Do not use the upstream `bump-version.sh` script for extension-only releases; it also modifies the unadapted website.

An unpacked extension does not update itself from GitHub. Users who load the tracked `extension/` folder only need to reload it after this workspace receives updated files. A store version is required for browser-managed updates.

## Secrets

This is a public repository. Never commit credentials or put them in extension source or packaged ZIPs. Run `pnpm check:secrets` before pushing. GitHub's push protection is enabled, and `.github/workflows/secret-check.yml` scans pushes and pull requests. If a key is exposed, rotate it; Git history retains old commits.
