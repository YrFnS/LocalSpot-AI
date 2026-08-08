import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  clearOpenRouterApiKey,
  fetchOpenRouterModels,
  isFreeModel,
  loadOpenRouterSettings,
  saveOpenRouterApiKey,
  saveOpenRouterModel,
  searchModels,
  selectModelId,
} from "./openrouter.mjs";

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  contextLength: number | null;
  pricing: { prompt: string | null; completion: string | null };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onChange: () => void;
}

const priceLabel = (value: string | null) => {
  const price = Number(value);
  if (value == null || !Number.isFinite(price) || price < 0) return "—";
  return `$${(price * 1_000_000).toFixed(2)}/M`;
};

export const OpenRouterSettings: React.FC<Props> = ({ isOpen, onClose, onChange }) => {
  const [apiKey, setApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [modelId, setModelId] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [status, setStatus] = useState("");

  const loadModels = async (refresh = false) => {
    setLoading(true);
    setCatalogError("");
    try {
      setModels(await fetchOpenRouterModels({ refresh }));
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Could not load models. Enter a model ID manually.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = loadOpenRouterSettings();
      setHasSavedKey(Boolean(saved.apiKey));
      setModelId(saved.model);
      setStatus("");
    } catch {
      setStatus("Browser storage is unavailable. Settings cannot be saved.");
    }
    if (models.length === 0) loadModels();
  }, [isOpen]);

  const visibleModels = useMemo(
    () => searchModels(models, query, freeOnly).slice(0, 100),
    [models, query, freeOnly],
  );

  const saveKey = () => {
    if (!apiKey.trim()) {
      setStatus("Enter an OpenRouter API key first.");
      return;
    }
    try {
      saveOpenRouterApiKey(apiKey);
      setApiKey("");
      setHasSavedKey(true);
      setStatus("API key saved in this browser only.");
      onChange();
    } catch {
      setStatus("Browser storage is unavailable. The key was not saved.");
    }
  };

  const clearKey = () => {
    try {
      clearOpenRouterApiKey();
      setApiKey("");
      setHasSavedKey(false);
      setStatus("Saved API key cleared.");
      onChange();
    } catch {
      setStatus("Browser storage is unavailable. The key could not be cleared.");
    }
  };

  const saveModel = (value = modelId) => {
    try {
      const selected = selectModelId(value, models);
      saveOpenRouterModel(selected);
      setModelId(selected);
      setStatus(`Model selected: ${selected}`);
      onChange();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Select a model first.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md p-3 md:p-8 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="openrouter-settings-title">
      <div className="w-full max-w-3xl max-h-full overflow-hidden bg-[#09090b] border border-zinc-700 shadow-2xl flex flex-col">
        <div className="p-4 md:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 id="openrouter-settings-title" className="text-sm font-bold font-mono tracking-widest text-white">OPENROUTER AI SETTINGS</h2>
            <p className="mt-1 text-[10px] font-mono text-zinc-500">Your key stays in this browser's local storage and is sent only as an OpenRouter Authorization Bearer header.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white" aria-label="Close AI settings">✕</button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
          <section className="space-y-2">
            <label htmlFor="openrouter-api-key" className="text-[10px] font-mono text-zinc-400 tracking-widest">OPENROUTER API KEY</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="openrouter-api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={hasSavedKey ? "A key is saved — enter a new one to replace it" : "Enter your OpenRouter API key"}
                autoComplete="off"
                className="flex-1 min-w-0 bg-black border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-primary"
              />
              <button onClick={saveKey} className="px-4 py-2 bg-primary text-black font-mono text-[10px] font-bold">SAVE KEY</button>
              <button onClick={clearKey} disabled={!hasSavedKey} className="px-4 py-2 border border-zinc-700 text-zinc-300 font-mono text-[10px] disabled:opacity-40">CLEAR KEY</button>
            </div>
            <p className="text-[10px] font-mono text-zinc-600">Status: {hasSavedKey ? "key saved locally" : "no key saved"}. Local browser storage is not encrypted; clear it on shared devices.</p>
          </section>

          <section className="space-y-3 border-t border-zinc-800 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="openrouter-model-id" className="text-[10px] font-mono text-zinc-400 tracking-widest">MODEL (REQUIRED)</label>
              <button onClick={() => loadModels(true)} disabled={loading} className="text-[10px] font-mono text-primary disabled:opacity-50">{loading ? "LOADING…" : "REFRESH LIVE CATALOG"}</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="openrouter-model-id"
                type="text"
                value={modelId}
                onChange={(event) => setModelId(event.target.value)}
                placeholder="Select below or enter an exact model ID"
                autoComplete="off"
                className="flex-1 min-w-0 bg-black border border-zinc-700 px-3 py-2 text-sm text-white font-mono outline-none focus:border-primary"
              />
              <button onClick={() => saveModel()} className="px-4 py-2 border border-primary text-primary font-mono text-[10px] font-bold">USE MODEL ID</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search model names and IDs"
                className="flex-1 min-w-0 bg-black border border-zinc-800 px-3 py-2 text-xs text-white outline-none focus:border-zinc-600"
              />
              <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} />
                FREE PRICING
              </label>
            </div>

            {catalogError && <p className="p-3 border border-amber-900/50 bg-amber-950/20 text-[10px] font-mono text-amber-300">{catalogError}</p>}

            <div className="max-h-72 overflow-y-auto border border-zinc-800 divide-y divide-zinc-800">
              {visibleModels.map((model) => (
                <button key={model.id} onClick={() => saveModel(model.id)} className={`w-full text-left p-3 hover:bg-zinc-900 ${modelId === model.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-xs text-white font-semibold">{model.name}</span>
                    {isFreeModel(model) && <span className="text-[9px] text-emerald-400 font-mono">FREE</span>}
                  </div>
                  <div className="text-[10px] font-mono text-primary break-all">{model.id}</div>
                  <div className="mt-1 text-[9px] font-mono text-zinc-500 flex flex-wrap gap-x-4">
                    <span>Context: {model.contextLength?.toLocaleString() || "—"}</span>
                    <span>Input: {priceLabel(model.pricing.prompt)}</span>
                    <span>Output: {priceLabel(model.pricing.completion)}</span>
                  </div>
                </button>
              ))}
              {!loading && visibleModels.length === 0 && <div className="p-4 text-[10px] font-mono text-zinc-600">No catalog matches. Enter the exact model ID above.</div>}
            </div>
            {models.length > 100 && <p className="text-[9px] font-mono text-zinc-600">Showing the first 100 matches. Search to narrow the catalog.</p>}
          </section>

          {status && <div role="status" className="p-3 border border-zinc-700 bg-zinc-900 text-[10px] font-mono text-zinc-200">{status}</div>}
        </div>
      </div>
    </div>
  );
};
