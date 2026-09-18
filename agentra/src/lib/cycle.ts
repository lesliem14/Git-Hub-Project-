/** 24-hour settlement cycles aligned to UTC midnight boundaries. */
export function getCurrentCycle() {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const elapsedMs = now.getTime() - start.getTime();
  const totalMs = end.getTime() - start.getTime();
  const progressPercent = (elapsedMs / totalMs) * 100;
  const cycleId = start.toISOString().slice(0, 10);

  return {
    cycleId,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    progressPercent,
    remainingMs: end.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}
