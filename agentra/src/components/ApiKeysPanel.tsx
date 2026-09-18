"use client";

import { useCallback, useEffect, useState } from "react";

type KeyRow = { id: string; name: string; prefix: string; createdAt: string };

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("Trading bot");
  const [secret, setSecret] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/account/api-keys");
    if (res.ok) {
      const d = await res.json();
      setKeys(d.keys ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setSecret(null);
    const res = await fetch("/api/v1/account/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const d = await res.json();
      setSecret(d.key?.secret ?? null);
      load();
    }
  };

  const revoke = async (id: string) => {
    await fetch(`/api/v1/account/api-keys?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">API keys</h2>
      <p className="text-xs text-slate-500">
        Use Bearer <code className="rounded bg-stone-100 px-1">agt_…</code> for programmatic access
        (executions, opportunities). Requires active license.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
          placeholder="Key name"
        />
        <button
          type="button"
          onClick={create}
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Create key
        </button>
      </div>
      {secret && (
        <p className="rounded-lg bg-amber-50 p-3 font-mono text-xs text-amber-950">
          Copy now — shown once: {secret}
        </p>
      )}
      <ul className="divide-y divide-stone-100 text-sm">
        {keys.map((k) => (
          <li key={k.id} className="flex items-center justify-between py-2">
            <span>
              {k.name} <span className="text-slate-400">({k.prefix}…)</span>
            </span>
            <button type="button" onClick={() => revoke(k.id)} className="text-rose-600 text-xs">
              Revoke
            </button>
          </li>
        ))}
        {keys.length === 0 && <li className="py-2 text-slate-500">No API keys yet.</li>}
      </ul>
    </div>
  );
}
