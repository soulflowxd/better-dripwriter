# Better Dripwriter

A cross-browser extension (Chrome / Edge / Firefox) that types pasted text into web editors, including Google Docs, Canvas, Brightspace, and standard `<textarea>`, `<input>`, or `[contenteditable]` fields.

- adjustable typing speed (20–150 WPM)
- keyboard-neighbor typos that get auto-corrected
- occasional false-start words pulled from nearby context and fully deleted
- configurable short breaks at sentence boundaries
- diagnostics mode for verifying typing event paths

Built with [Plasmo](https://docs.plasmo.com/) + React + TypeScript.

## Attribution

Better Dripwriter is based on [Dripwriter Origin](https://github.com/alexey-max-fedorov/dripwriter-origin) by Alexey Fedorov. The original license remains in [LICENSE](./LICENSE). This project is independent of Dripwriter, LLC and its commercial service.

## Design

The extension icon in [`assets/icon.png`](./assets/icon.png) uses an ivory pen-nib **b** and a blue ink drop. The popup uses translucent glass panels, a soft blue glow, rounded controls, a text area, live status, and collapsible typing settings. Dark and light themes are available.

Typos use nearby letter keys only. The **Spelling slips** setting occasionally misspells the current word, deletes it, and types the correct word.

## Develop

```bash
pnpm install
pnpm dev               # Chrome MV3 development (HMR) → build/chrome-mv3-dev
pnpm dev:firefox       # Firefox MV3 development     → build/firefox-mv3-dev
```

For Chrome or Edge, load the ready-to-use [`extension/`](./extension/) folder from this project:

1. Open `chrome://extensions` or `edge://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this project's `extension` folder (the folder containing `manifest.json`).
3. Remove any older ZIP-installed or Dripwriter Origin copy if it appears as a second extension.

For Firefox development, open `about:debugging#/runtime/this-firefox` and use **Load Temporary Add-on** with `build/firefox-mv3-dev/manifest.json` after running `pnpm dev:firefox`.

### Updating an installed copy

The project keeps `extension/` updated whenever `pnpm build` or `pnpm package` runs. After pulling a new commit, or after Codex rebuilds the project, click **Reload** on the extension card in `chrome://extensions` or `edge://extensions`. If you edit source files yourself, run `pnpm build` first. No ZIP download or repeated folder selection is needed. Firefox temporary add-ons must be loaded again after a browser restart.

For browser-managed automatic updates, publish the extension through the Chrome Web Store, Edge Add-ons, or Mozilla Add-ons. A GitHub push alone does not update installed copies.

## Build & package

```bash
pnpm build             # Chrome MV3 production  → extension/ and build/chrome-mv3-prod
pnpm build:firefox     # Firefox MV3 production → build/firefox-mv3-prod
pnpm package           # Zips both into build/chrome-mv3-prod.zip and build/firefox-mv3-prod.zip
```

The ready-to-load `extension/` folder and packaged `*.zip` files in `build/` are tracked in git. The intermediate `build/<target>/` directories are not.

## Credential safety

Keep API keys, tokens, passwords, private keys, and signing files out of this public repository and out of the extension bundle. Local `.env` files and common credential file types are ignored by Git. Run `pnpm check:secrets` before pushing; CI runs the same check on pushes and pull requests. GitHub secret scanning and push protection are enabled for this repository. If a real credential was ever committed, revoke or rotate it: removing a file from the latest commit does not erase it from Git history.

## Usage

1. Open a web page with a text box — a Google Doc, a Canvas assignment, a Brightspace discussion or assignment editor, the Packback editor, or any standard textarea / contenteditable field.
2. Click where the typing should begin.
3. Open the Better Dripwriter popup from the toolbar.
4. Paste your text, tune the cadence, and press **Start**.
5. Reopen the popup and press **Stop** at any time, or **Run Test** to verify which typing event paths work.

Rich editors may live in embedded frames or open shadow roots. Click inside the actual editor before pressing Start. Browser extensions cannot type into browser-protected pages, native desktop apps, or closed shadow roots; some web editors also reject synthetic input. Use **Run Test** on an unfamiliar editor before a longer run.

Canvas assignments configured for **File Upload** do not have a text-entry editor. The extension can type only when the assignment or discussion provides an actual text field. The popup stays open after Start so it can show an editor error rather than silently closing.

## Marketing site

The upstream Next.js marketing site remains in [`website/`](./website). It has not been adapted for this fork.

## License

[Original project license](./LICENSE) — noncommercial copying, modification, and distribution of the original **extension code** are permitted when the license terms and [required notice](./NOTICE.txt) accompany copies. Commercial use requires a separate license from the original author. The Chrome and Firefox packages include both files. The upstream `website/` is outside the license's stated extension scope; do not assume the same permission covers that site.
