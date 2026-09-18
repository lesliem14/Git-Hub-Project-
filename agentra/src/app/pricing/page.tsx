import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["Limited dashboard", "Historical opportunities", "Paper trading"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "$49/mo",
    features: ["Automated strategies", "1 chain", "Execution volume caps"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$149/mo",
    features: ["More strategies & chains", "Advanced analytics", "Higher limits"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: ["API access", "Custom strategies", "Dedicated infra & reporting"],
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8 pb-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Licensing & pricing</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Software subscription only. Optional performance-based fees may apply where legally
          permitted and contractually disclosed—never framed as guaranteed investment returns.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-5 shadow-sm ${
              p.highlighted
                ? "border-teal-300 bg-teal-50/40 ring-2 ring-teal-600/20"
                : "border-stone-200 bg-white"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
            <p className="mt-1 text-2xl font-bold text-teal-800">{p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {p.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500">
        Flow: User → Account → Subscription → License → API entitlement → Bot permissions
      </p>
      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Start with paper trading
        </Link>
      </div>
    </div>
  );
}
