import { useCallback, useEffect, useRef, useState } from "react";

import {
  API_MODE_STORAGE_KEY,
  DEFAULT_SETTINGS,
  type DripwriterMessage,
  type DripwriterResponse,
  type DripwriterSettings,
  type TargetFrameResponse,
  type TypingStatus
} from "./types";
import { VERSION_TAG } from "~/lib/version";

type StatusState = "idle" | "running" | "error" | "done";

function stateForStatus(status: TypingStatus, settled: StatusState): StatusState {
  if (status.failed) return "error";
  return status.running ? "running" : settled;
}

const THEME_KEY = "dripwriterTheme";

function MixRow({ id, label, unit, min, max, step = 1, value, onChange }: {
  id: string; label: string; unit: string;
  min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="mix-row">
      <span className="mr-label">{label}</span>
      <div className="mr-track-wrap">
        <input
          type="range" min={min} max={max} step={step} value={value} aria-label={label}
          onChange={e => {
            const v = Number(e.target.value);
            onChange(v);
            const pct = (v - min) / (max - min) * 100;
            e.target.style.setProperty("--pct", `${pct}%`);
          }}
          ref={el => {
            if (el) {
              const pct = (value - min) / (max - min) * 100;
              el.style.setProperty("--pct", `${pct}%`);
            }
          }}
        />
      </div>
      <span className="mr-val"><span>{value}</span><em>{unit}</em></span>
    </div>
  );
}

const STORAGE_KEY = "dripwriterSettings";

export default function PopupView() {
  const [settings, setSettings] = useState<DripwriterSettings>(DEFAULT_SETTINGS);
  const [statusDetail, setStatusDetail] = useState<string>(
    "Idle. Click into any text box, then press Start."
  );
  const [statusState, setStatusState] = useState<StatusState>("idle");
  const [resumable, setResumable] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const loaded = useRef(false);
  const themeLoaded = useRef(false);
  const [apiMode, setApiMode] = useState<boolean>(false);
  const apiModeLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = (await chrome.storage.local.get({ dripwriterSettings: DEFAULT_SETTINGS })) as {
        dripwriterSettings?: Partial<DripwriterSettings>;
      };

      const merged: DripwriterSettings = {
        ...DEFAULT_SETTINGS,
        ...stored.dripwriterSettings
      };

      if (merged.breakMaxSeconds < merged.breakMinSeconds) {
        merged.breakMaxSeconds = merged.breakMinSeconds;
      }

      if (cancelled) return;
      setSettings(merged);
      loaded.current = true;

      void refreshStatus();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void chrome.storage.local.set({ [STORAGE_KEY]: settings });
  }, [settings]);

  useEffect(() => {
    chrome.storage.local.get({ [THEME_KEY]: "dark" }).then(r => {
      setTheme((r[THEME_KEY] as "dark" | "light") || "dark");
      themeLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    if (!themeLoaded.current) return;
    void chrome.storage.local.set({ [THEME_KEY]: theme });
  }, [theme]);

  useEffect(() => {
    chrome.storage.local.get({ [API_MODE_STORAGE_KEY]: false }).then(r => {
      setApiMode(Boolean(r[API_MODE_STORAGE_KEY]));
      apiModeLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!apiModeLoaded.current) return;
    void chrome.storage.local.set({ [API_MODE_STORAGE_KEY]: apiMode });
  }, [apiMode]);

  const sendToActiveTab = useCallback(
    async (
      message: DripwriterMessage,
      reportErrors = true
    ): Promise<DripwriterResponse | null> => {
      const fail = (detail: string) => {
        if (!reportErrors) return;
        setStatusDetail(detail);
        setStatusState("error");
      };

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        fail("No active tab to type into.");
        return null;
      }

      const isDocs = tab.url?.startsWith("https://docs.google.com/document/");
      let frameId: number | undefined = isDocs ? 0 : undefined;

      if (!isDocs) {
        const res = (await chrome.runtime.sendMessage({
          type: "GET_TARGET_FRAME",
          tabId: tab.id
        })) as TargetFrameResponse | undefined;

        if (res?.frameId == null) {
          fail("No text editor is selected. Click inside a text-entry field first. File-upload-only Canvas assignments cannot accept typed text.");
          return null;
        }
        frameId = res.frameId;
      }

      try {
        return (await chrome.tabs.sendMessage(
          tab.id,
          message,
          frameId != null ? { frameId } : undefined
        )) as DripwriterResponse;
      } catch {
        fail("Reload the page so the extension can attach, then try again.");
        return null;
      }
    },
    []
  );

  const refreshStatus = useCallback(async () => {
    // Status polls must not paint an error. A missing target or a blip while
    // a run is in progress used to flip the bar red and stop the live updates.
    const response = await sendToActiveTab({ type: "GET_STATUS" }, false);
    if (!response) return;
    setStatusDetail(response.status.detail);
    setStatusState(stateForStatus(response.status, "idle"));
    setResumable(Boolean(response.status.resumable) && !response.status.running);
  }, [sendToActiveTab]);

  useEffect(() => {
    if (statusState !== "running") return;
    const id = setInterval(() => void refreshStatus(), 500);
    return () => clearInterval(id);
  }, [statusState, refreshStatus]);

  const onStart = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!settings.text.trim()) {
        setStatusDetail("Paste some text into the extension first.");
        setStatusState("error");
        return;
      }

      let payload = settings;
      if (settings.breakMaxSeconds < settings.breakMinSeconds) {
        payload = { ...settings, breakMaxSeconds: settings.breakMinSeconds };
        setSettings(payload);
      }

      setResumable(false);

      const response = await sendToActiveTab({ type: "START_DRIP", payload });
      if (!response) return;

      setStatusDetail(response.status.detail);
      setStatusState(stateForStatus(response.status, "done"));

      // Keep the popup visible so a failed editor probe can report its error.
    },
    [settings, sendToActiveTab]
  );

  const onStop = useCallback(async () => {
    const response = await sendToActiveTab({ type: "STOP_DRIP" });
    if (!response) {
      setStatusDetail("Stopped locally.");
      setStatusState("idle");
      setResumable(false);
      return;
    }
    setStatusDetail(response.status.detail);
    setStatusState("idle");
    setResumable(Boolean(response.status.resumable) && !response.status.running);
  }, [sendToActiveTab]);

  const onResume = useCallback(async () => {
    const response = await sendToActiveTab({ type: "RESUME_DRIP", payload: { ...settings } });
    if (!response) return;

    setStatusDetail(response.status.detail);
    setStatusState(stateForStatus(response.status, "done"));

    if (!response.status.resumable) {
      setResumable(false);
    }

    if (response.ok) {
      window.close();
    }
  }, [settings, sendToActiveTab]);

  const onDiagnostics = useCallback(async () => {
    const response = await sendToActiveTab({ type: "RUN_DIAGNOSTICS" });
    if (!response) return;
    setResumable(false);
    setStatusDetail(response.status.detail);

    setStatusState(stateForStatus(response.status, "done"));
    if (response.ok) window.close();
  }, [sendToActiveTab]);

  const update = <K extends keyof DripwriterSettings>(key: K, value: DripwriterSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="shell">
      <header className="hero">
        <img
          className="brand-mark"
          src={chrome.runtime.getURL(chrome.runtime.getManifest().icons?.["48"] ?? "")}
          alt=""
          aria-hidden="true"
        />
        <div className="brand-copy">
          <h1 className="title"><span>Better</span> Dripwriter</h1>
          <p className="hero-description">Your words, at your pace.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <section className="status" data-state={statusState}>
        <span className="status-detail">{statusDetail}</span>
      </section>

      <form className="panel" onSubmit={onStart}>
        <label className="text-block" htmlFor="text">
          <span className="text-block__label"><span>01</span> Your text</span>
          <textarea
            id="text"
            rows={8}
            placeholder="Paste your text here..."
            value={settings.text}
            onChange={(e) => update("text", e.target.value)}
          />
          <span className="text-count">{settings.text.length} characters</span>
        </label>

        <details className="settings-panel">
          <summary><span><span className="section-number">02</span> Typing settings</span><span className="settings-caret" aria-hidden="true">⌄</span></summary>
          <div className="mixer">

          {/* Speed */}
          <div className="mix-group">
            <div className="mix-group-hd">Speed</div>
            <MixRow id="wpm" label="Typing speed"  unit="wpm" min={20}  max={150} value={settings.wpm}          onChange={v => update("wpm", v)} />
            <MixRow id="sv"  label="Speed variance" unit="%"   min={0}   max={80}  value={settings.speedVariance} onChange={v => update("speedVariance", v)} />
          </div>

          {/* Breaks */}
          <div className="mix-group">
            <div className="mix-group-hd">Breaks</div>
            <MixRow id="bf"   label="Break frequency" unit="s"  min={15} max={180} step={5} value={settings.breakFrequencySeconds}  onChange={v => update("breakFrequencySeconds", v)} />
            <MixRow id="bfv"  label="Frequency vary"  unit="%"  min={0}  max={100} step={5} value={settings.breakFrequencyVariance} onChange={v => update("breakFrequencyVariance", v)} />
            <MixRow id="bmin" label="Shortest break"  unit="s"  min={3}  max={20}           value={settings.breakMinSeconds}        onChange={v => update("breakMinSeconds", v)} />
            <MixRow id="bmax" label="Longest break"   unit="s" min={4}  max={25}           value={settings.breakMaxSeconds}       onChange={v => update("breakMaxSeconds", v)} />
          </div>

          {/* Natural Mistakes */}
          <div className="mix-group">
            <div className="mix-group-hd">Natural Mistakes</div>
            <MixRow id="typo" label="Typos"        unit="%" min={0} max={25} value={settings.typoRate}   onChange={v => update("typoRate", v)} />
            <MixRow id="fs"   label="Spelling slips" unit="%" min={0} max={20} value={settings.detourRate} onChange={v => update("detourRate", v)} />
          </div>

          </div>
        </details>

        <div className="actions">
          <button type="submit" className="button button--primary">
            Start
          </button>
          {resumable && statusState !== "running" && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void onResume()}
            >
              Resume
            </button>
          )}
          <button
            type="button"
            className="button button--ghost"
            onClick={() => void onDiagnostics()}
          >
            Run Test
          </button>
          {statusState === "running" && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void onStop()}
            >
              Stop
            </button>
          )}
        </div>
      </form>

      <div className="api-toggle">
        <label className="api-toggle__row">
          <input
            type="checkbox"
            checked={apiMode}
            onChange={(e) => setApiMode(e.target.checked)}
          />
          <span className="api-toggle__label">Enable API mode</span>
          <span
            className="api-toggle__pill"
            aria-hidden
            data-on={apiMode}
          />
        </label>
        <p className="api-toggle__hint">
          Exposes <code>window._dripwriter</code> on the active page. Active immediately — no reload needed.
        </p>
      </div>
      <footer className="popup-footer">
        <span className="footer-brand">BETTER DRIPWRITER</span>
        <span className="popup-version">{VERSION_TAG}</span>
      </footer>
    </main>
  );
}
