export default function RiskDisclosuresPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl pb-8 prose-headings:text-slate-900">
      <h1>Risk disclosures</h1>
      <p>
        Agentra provides software tools for researching and executing on-chain trading
        strategies. We do not guarantee profitability, specific returns, or uninterrupted
        service.
      </p>
      <ul>
        <li>Smart contract, bridge, and wallet risks can cause total loss of funds.</li>
        <li>MEV competition, reverts, and gas spikes can eliminate expected edge.</li>
        <li>Regulatory treatment of crypto software and referrals varies by country.</li>
        <li>Paper trading results may not match live execution latency or fill rates.</li>
      </ul>
      <p>Only deploy capital you can afford to lose. Seek independent legal and tax advice.</p>
    </article>
  );
}
