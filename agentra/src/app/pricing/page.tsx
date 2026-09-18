import { PricingCheckout } from "@/components/PricingCheckout";
import { LICENSE_FEE_USDT, PERFORMANCE_FEE_RATE } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="space-y-8 pb-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Licensing</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          One-time software license unlocks automated strategies. Credit stays in your account for
          trading allocation and is <strong>not withdrawable</strong>.
        </p>
      </header>

      <div className="mx-auto max-w-lg rounded-3xl border-2 border-teal-300 bg-white p-8 shadow-sm ring-4 ring-teal-600/10">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">Agentra license</p>
        <p className="mt-2 text-4xl font-bold text-slate-900">
          {formatUsdt(LICENSE_FEE_USDT)}{" "}
          <span className="text-lg font-medium text-slate-500">USDT · one-time</span>
        </p>
        <ul className="mt-6 space-y-2 text-sm text-slate-700">
          <li>· Automated MEV searcher strategies (allowlisted)</li>
          <li>· Paper trading → gated live execution</li>
          <li>· Dashboard, analytics, 24h settlement reporting</li>
          <li>· {formatUsdt(LICENSE_FEE_USDT)} USDT account credit for trading (non-withdrawable)</li>
        </ul>
        <PricingCheckout />
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-slate-600">
        <strong className="text-slate-900">MVP performance fee:</strong>{" "}
        {(PERFORMANCE_FEE_RATE * 100).toFixed(0)}% on positive net trading profit, deducted at 24h
        settlement (disclosed in terms—not a promise of profit).
      </div>

      <p className="text-center text-xs text-slate-500">
        User → Account → License payment → Entitlements → Bot permissions · Enterprise/API on
        roadmap
      </p>
    </div>
  );
}
