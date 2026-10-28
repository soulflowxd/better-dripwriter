# Better Drip Writter

A cross-browser extension (Chrome / Edge / Firefox) that types pasted text into web editors, including Google Docs, Canvas, Brightspace, and standard `<textarea>`, `<input>`, or `[contenteditable]` fields.

- adjustable typing speed (20–150 WPM)
- keyboard-neighbor typos that get auto-corrected
- occasional false-start words pulled from nearby context and fully deleted
- configurable short breaks at sentence boundaries
- diagnostics mode for verifying typing event paths

Built with [Plasmo](https://docs.plasmo.com/) + React + TypeScript.

## Attribution

Better Drip Writter is based on [Dripwriter Origin](https://github.com/alexey-max-fedorov/dripwriter-origin) by Alexey Fedorov. The original license remains in [LICENSE](./LICENSE). This project is independent of Dripwriter, LLC and its commercial service.

## Design

The extension icon in [`assets/icon.png`](./assets/icon.png) uses an ivory pen-nib **b** and a blue ink drop. The popup uses the same blue accent, with “Better” highlighted and a short, single-line label above the title.

## Develop

```bash
pnpm install
pnpm dev               # Chrome MV3 development (HMR) → build/chrome-mv3-dev
pnpm dev:firefox       # Firefox MV3 development     → build/firefox-mv3-dev
```

Load the development build as an **unpacked extension**:
- Chrome / Edge: `chrome://extensions` → enable Developer mode → Load unpacked → `build/chrome-mv3-dev`
- Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `build/firefox-mv3-dev/manifest.json`

### Updating an installed copy

An unpacked Chrome or Edge extension does not fetch changes from GitHub. Download the latest `build/chrome-mv3-prod.zip`, replace the contents of the folder you originally loaded, then click **Reload** on its card in `chrome://extensions` or `edge://extensions`. Remove any older **Dripwriter Origin** installation if it is still listed; otherwise both extensions may appear in the toolbar. Firefox temporary add-ons must be loaded again after a browser restart.

For browser-managed automatic updates, publish the extension through the Chrome Web Store, Edge Add-ons, or Mozilla Add-ons. A GitHub push alone does not update installed copies.

## Build & package

```bash
pnpm build             # Chrome MV3 production  → build/chrome-mv3-prod
pnpm build:firefox     # Firefox MV3 production → build/firefox-mv3-prod
pnpm package           # Zips both into build/chrome-mv3-prod.zip and build/firefox-mv3-prod.zip
```

The packaged `*.zip` files in `build/` are tracked in git; the unpacked `build/<target>/` directories are not.

## Usage

1. Open a web page with a text box — a Google Doc, a Canvas assignment, a Brightspace discussion or assignment editor, the Packback editor, or any standard textarea / contenteditable field.
2. Click where the typing should begin.
3. Open the Better Drip Writter popup from the toolbar.
4. Paste your text, tune the cadence, and press **Start**.
5. Reopen the popup and press **Stop** at any time, or **Run Test** to verify which typing event paths work.

Rich editors may live in embedded frames or open shadow roots. Click inside the actual editor before pressing Start. Browser extensions cannot type into browser-protected pages, native desktop apps, or closed shadow roots; some web editors also reject synthetic input. Use **Run Test** on an unfamiliar editor before a longer run.

## Marketing site

The upstream Next.js marketing site remains in [`website/`](./website). It has not been adapted for this fork.

## License

[Original project license](./LICENSE) — noncommercial use is permitted; commercial use requires a separate license.
