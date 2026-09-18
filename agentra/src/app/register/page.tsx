"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usdtPayout, setUsdtPayout] = useState("");
  const [referralCode, setReferralCode] = useState(params.get("ref") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
        usdtPayoutTrc20: usdtPayout || undefined,
        referralCode: referralCode || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Create your Agentra account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Link your own TRC-20 wallet. Fund by sending USDT from that wallet to our treasury address.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password (min 8 chars)
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Your USDT TRC-20 wallet (TronLink / Trust — you control the keys)
          <input
            required
            value={usdtPayout}
            onChange={(e) => setUsdtPayout(e.target.value.trim())}
            placeholder="T..."
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm"
          />
        </label>
        <p className="text-xs text-slate-500 -mt-2">
          Used for payouts and to identify your deposits when you send USDT to Agentra treasury.
        </p>
        <label className="block text-sm font-medium text-slate-700">
          Referral code (optional)
          <input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-800 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading…</p>}>
      <RegisterForm />
    </Suspense>
  );
}
