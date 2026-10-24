import { bus } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-sent events: live session progress and "she smiled" notifications.
export async function GET(req: Request) {
  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: { event: string; data: unknown }) => {
        try {
          controller.enqueue(enc.encode(`event: ${msg.event}\ndata: ${JSON.stringify(msg.data)}\n\n`));
        } catch {}
      };
      const ping = setInterval(() => {
        try { controller.enqueue(enc.encode(`: ping\n\n`)); } catch {}
      }, 15000);
      bus().on("event", send);
      controller.enqueue(enc.encode(`: open\n\n`));
      cleanup = () => {
        clearInterval(ping);
        bus().off("event", send);
      };
      req.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch {}
      });
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
