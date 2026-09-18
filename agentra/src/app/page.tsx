import Link from "next/link";
import { ArrowRight, Bot, LineChart, Shield, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-8">
      <section className="rounded-3xl border border-stone-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
          Agentra
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          The AI Agent Network for on-chain Markets
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Subscription software that monitors DEX liquidity, simulates opportunities, and
          helps you execute <strong>legitimate</strong> MEV strategies from your own wallet.
          We never hold private keys and we block harmful sandwich tactics by policy.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Launch dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-[#f7f5f0] px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white"
          >
            See how it works
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Wallet,
            title: "Non-custodial",
            text: "Funds stay in your wallet until you sign a transaction.",
          },
          {
            icon: Bot,
            title: "AI risk filter",
            text: "Scores execution probability—not price direction hype.",
          },
          {
            icon: Shield,
            title: "Safety rails",
            text: "Allowlists, caps, kill switch, and simulation-first workflow.",
          },
          {
            icon: LineChart,
            title: "Transparent P&L",
            text: "Gross, gas, fees, net, and 24h settlement reporting.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <Icon className="h-5 w-5 text-teal-700" />
            <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm text-amber-950">
        <strong>Important:</strong> Agentra is software, not a guaranteed income product.
        Past simulations do not promise future results. Opportunities can disappear due to
        competition, gas, or failed transactions.
      </section>
    </div>
  );
}
