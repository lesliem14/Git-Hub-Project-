import { REFERRAL_TIERS, LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

export default function ReferralPage() {
  const referralLink = "https://app.agentra.network/r/AGT-demo8K2";

  return (
    <div className="space-y-6 pb-4">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Referral program</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Commissions are paid on <strong>software license fees only</strong> (the{" "}
          {formatUsdt(LICENSE_FEE_USDT)} USDT one-time license)—not on trading profits or losses.
          Earnings accrue to your internal balance and pay out on the 24h USDT TRC-20 cycle with
          your other withdrawable amounts.
        </p>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Your link</p>
        <p className="mt-2 break-all font-mono text-sm text-teal-800">{referralLink}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Rate on license fee</th>
              <th className="px-4 py-3 text-right">Example per license sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {REFERRAL_TIERS.map((t) => (
              <tr key={t.level}>
                <td className="px-4 py-3 font-medium">
                  Level {t.level} ({t.label})
                </td>
                <td className="px-4 py-3">{(t.rate * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatUsdt(LICENSE_FEE_USDT * t.rate)} USDT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-stone-100 px-4 py-3 text-xs text-slate-500">
          Example: Level 1 earns {formatUsdt(LICENSE_FEE_USDT * 0.15)} USDT when a direct referral
          activates their license. Not a guarantee of income.
        </p>
      </div>
    </div>
  );
}
