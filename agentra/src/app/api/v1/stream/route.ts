import { getAuthContext } from "@/server/auth-context";
import { getLiveFeed } from "@/server/live-feed-service";
import { getBotConfig } from "@/server/bot-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const push = async () => {
        if (closed) return;
        try {
          const [events, bot] = await Promise.all([
            getLiveFeed(8, auth.accountId),
            getBotConfig(auth.accountId),
          ]);
          controller.enqueue(
            encoder.encode(
              `event: tick\ndata: ${JSON.stringify({ events, bot: { status: bot.status, mode: bot.mode } })}\n\n`,
            ),
          );
        } catch {
          controller.enqueue(encoder.encode(`event: error\ndata: {}\n\n`));
        }
      };

      void push();
      const interval = setInterval(() => void push(), 4000);
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
