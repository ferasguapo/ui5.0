"use client";

import { useState, useEffect } from "react";

// AdSense component
function AdSenseAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsense push error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-2479836262167230"
      data-ad-slot="4794678327"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function LinkList({ items }: { items: { title: string; url: string; price?: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, i) => (
        <li key={i}>
          <a className="underline" href={it.url} target="_blank" rel="noreferrer">
            {it.title}
          </a>
          {it.price ? <span className="ml-2 opacity-70">{it.price}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function ResponseRenderer({ data, youtube, oreilly }: { data: any; youtube?: any[]; oreilly?: any[] }) {
  if (!data) return null;
  return (
    <div className="prose max-w-none">
      {data.summary && (
        <Section title="Overview">
          <p>{data.summary}</p>
        </Section>
      )}
      {data.trouble_code && (
        <Section title="Trouble Code">
          <p className="font-mono">{data.trouble_code}</p>
        </Section>
      )}
      {data.steps && data.steps.length ? (
        <Section title="Diagnostic Steps">
          <List items={data.steps} />
        </Section>
      ) : null}
      {data.repair_steps && data.repair_steps.length ? (
        <Section title="Repair Steps">
          <List items={data.repair_steps} />
        </Section>
      ) : null}
      {data.tools && data.tools.length ? (
        <Section title="Tools Needed">
          <List items={data.tools} />
        </Section>
      ) : null}
      {(data.estimated_time || data.estimated_cost) && (
        <Section title="Estimates">
          <ul className="list-disc pl-5 space-y-1">
            {data.estimated_time ? <li>Estimated Time: {data.estimated_time}</li> : null}
            {data.estimated_cost ? <li>Estimated Cost: {data.estimated_cost}</li> : null}
          </ul>
        </Section>
      )}
      {Array.isArray(oreilly) && oreilly.length ? (
        <Section title="Parts (O’Reilly Auto Parts)">
          <LinkList items={oreilly} />
        </Section>
      ) : null}
      {Array.isArray(youtube) && youtube.length ? (
        <Section title="Related Videos">
          <LinkList items={youtube} />
        </Section>
      ) : null}
      {data.next_actions && data.next_actions.length ? (
        <Section title="Next Actions">
          <List items={data.next_actions} />
        </Section>
      ) : null}
    </div>
  );
}

type Result = {
  ok: boolean;
  data?: any;
  raw?: string;
  error?: string;
};

export default function Home() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [part, setPart] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [provider, setProvider] = useState("openai");
  const [modelName, setModelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, make, model, part, code, notes, provider, modelName }),
      });
      const json = await resp.json();
      setResult(json);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error" });
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setYear("");
    setMake("");
    setModel("");
    setPart("");
    setCode("");
    setNotes("");
    setResult(null);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <header className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-[color:var(--accent)] grid place-items-center text-white font-bold shadow-card">
            🔧
          </div>
          <h1 className="text-3xl font-semibold">obuddy5000</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4 text-[color:var(--subtle)]">Vehicle Details</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input className="input" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
                <input className="input" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} />
                <input className="input" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Part (e.g., Starter, O2 Sensor)" value={part} onChange={(e) => setPart(e.target.value)} />
                <input className="input" placeholder="OBD-II Code (e.g., P0303)" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <textarea className="input h-28 resize-none" placeholder="Ask anything (symptoms, questions…)" value={notes} onChange={(e) => setNotes(e.target.value)} />

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="input flex items-center gap-2">
                  <select className="bg-transparent outline-none flex-1" value={provider} onChange={(e) => setProvider(e.target.value)}>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                  <input className="bg-transparent outline-none text-sm" placeholder="Model (optional)" value={modelName} onChange={(e) => setModelName(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-primary flex-1" type="submit" disabled={loading}>
                    {loading ? "Diagnosing…" : "Diagnose"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={onClear}>
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4 text-[color:var(--subtle)]">Result</h2>
            {!result && (
              <div className="text-[color:var(--subtle)] text-sm">
                Results will appear here as formatted JSON.
              </div>
            )}
            {result && result.ok && (
              <>
                <pre className="bg-[color:var(--muted)] rounded-2xl p-4 text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>

                {/* Render AdSense after results */}
                <div className="mt-6">
                  <AdSenseAd />
                </div>
              </>
            )}
            {result && !result.ok && (
              <div className="rounded-2xl border border-[color:var(--bad)] p-4 text-[color:var(--bad)] text-sm">{result.error}</div>
            )}
            {result?.raw && (
              <details className="mt-3">
                <summary className="cursor-pointer text-[color:var(--subtle)]">Raw model output</summary>
                <pre className="bg-[color:var(--muted)] rounded-2xl p-4 text-xs overflow-auto mt-2">{result.raw}</pre>
              </details>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-[color:var(--subtle)]">made by feras</footer>
      </div>
    </main>
  );
}
