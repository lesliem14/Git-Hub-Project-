import Image from "next/image";
import Link from "next/link";
import { AgentraArbitrageFlow } from "@/components/AgentraArbitrageFlow";

export const metadata = {
  title: "How Agentra Works",
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-10 pb-6">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          How the platform works
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Agentra is <strong>AI MEV Searcher as a Service</strong>—software that finds
          economically legitimate on-chain opportunities, simulates them, and executes only when
          expected net profit exceeds costs plus your safety buffer. We explicitly{" "}
          <strong>do not</strong> deploy sandwich attacks, malicious front-running, or tactics
          designed to harm another trader&apos;s execution.
        </p>
      </header>

      <AgentraArbitrageFlow />

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Reference: mechanics of transaction ordering (educational)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The diagrams below illustrate how ordering and mempool visibility work on Ethereum.
          Agentra uses this knowledge for <strong>simulation, latency budgeting, and benign
          strategies</strong> (e.g., arbitrage and liquidations)—not for user-harming sandwiches.
        </p>
        <div className="mt-6 space-y-6">
          <figure className="overflow-hidden rounded-xl border border-stone-200 bg-[#faf8f3]">
            <Image
              src="/explainer-mev-flow.jpg"
              alt="Educational diagram of transaction ordering in a mempool—not an Agentra strategy we deploy"
              width={1200}
              height={630}
              className="h-auto w-full"
            />
            <figcaption className="border-t border-stone-100 px-4 py-3 text-xs text-slate-500">
              Educational reference only. Agentra policy blocks sandwich and malicious
              front-running modules in production.
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-xl border border-stone-200 bg-[#faf8f3]">
            <Image
              src="/strategy-reference.png"
              alt="Five-step strategy workflow reference for DEX monitoring"
              width={1200}
              height={400}
              className="h-auto w-full"
            />
            <figcaption className="border-t border-stone-100 px-4 py-3 text-xs text-slate-500">
              Agentra&apos;s live pipeline replaces harmful steps with: detect gap → simulate →
              AI/risk score → profitability check → signed execution.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
          <h3 className="font-semibold text-teal-950">Supported opportunity types (MVP→)</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-teal-900/90">
            <li>DEX arbitrage & cross-DEX discrepancies</li>
            <li>Liquidations (allowlisted protocols)</li>
            <li>Benign back-running where user harm is not expected</li>
            <li>Cross-chain (when bridges and economics justify)</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
          <h3 className="font-semibold text-rose-950">Blocked by policy</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-rose-900/90">
            <li>Sandwich attacks on retail swaps</li>
            <li>Malicious front-running / wallet draining</li>
            <li>Deceptive or obfuscated transaction flows</li>
          </ul>
        </div>
      </section>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Try paper trading on the dashboard
        </Link>
      </div>
    </div>
  );
}
