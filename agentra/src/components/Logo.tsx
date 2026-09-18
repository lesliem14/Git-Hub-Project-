import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-sm">
        Ag
      </span>
      <div className="leading-tight">
        <span className="block text-base font-semibold tracking-tight text-slate-900">
          Agentra
        </span>
        <span className="hidden text-[10px] font-medium text-slate-500 sm:block">
          The AI Agent Network for on-chain Markets
        </span>
      </div>
    </Link>
  );
}
