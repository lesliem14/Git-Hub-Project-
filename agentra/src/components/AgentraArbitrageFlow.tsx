export function AgentraArbitrageFlow() {
  const steps = [
    {
      n: 1,
      title: "Ingest market data",
      body: "Pools, quotes, gas, and public protocol events across allowlisted chains.",
    },
    {
      n: 2,
      title: "Detect opportunity",
      body: "Arbitrage, cross-DEX gaps, or liquidations with explicit capital requirements.",
    },
    {
      n: 3,
      title: "Simulate & estimate costs",
      body: "Gas, protocol fees, slippage, builder tips, failure probability.",
    },
    {
      n: 4,
      title: "AI / risk filter",
      body: "Should we execute this specific opportunity—not “will ETH go up?”",
    },
    {
      n: 5,
      title: "Execute & verify",
      body: "Your wallet signs; we verify receipt, P&L, and log to analytics + 24h settlement.",
    },
  ];

  return (
    <section className="rounded-2xl border border-stone-200 bg-[#faf8f3] p-5 shadow-sm sm:p-8">
      <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
        Agentra execution pipeline
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">
        DATA → DETECTION → SIMULATION → AI/RISK → PROFIT CHECK → EXECUTION → VERIFICATION →
        ANALYTICS
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <li
            key={s.n}
            className="relative rounded-xl border border-stone-200/80 bg-white p-4 text-center shadow-sm"
          >
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
              {s.n}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
