import { createRequestHandler, RouterContextProvider } from "react-router";
import { appContext } from "~/context.server";
import { enforceRateLimit } from "~/services/http.server";
import { deleteExpiredCards } from "~/services/retention.server";

const handleRequest = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

function getRoutePath(request: Request) {
  const path = new URL(request.url).pathname;
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

export default {
  async fetch(request, env, ctx) {
    const path = getRoutePath(request);
    const draw = /^\/+draw(?:[/.]|$)/i.test(path);
    const cardPage = /^\/+cards(?:[/.]|$)/i.test(path);
    const dynamicRead = draw || cardPage;
    const readMethod = request.method === "GET" || request.method === "HEAD";
    try {
      if (dynamicRead && (readMethod || draw)) {
        await enforceRateLimit(request, env.RATE_LIMIT_READ, "card-read");
      }

      const context = new RouterContextProvider();
      context.set(appContext, { cloudflare: { env, ctx } });
      const response = await handleRequest(request, context);
      const write = request.method === "POST" && (cardPage || path === "/" || path === "/_.data");
      if (!dynamicRead && !write) return response;

      const noStore = new Response(response.body, response);
      noStore.headers.set("Cache-Control", "no-store");
      if (response.status === 429) noStore.headers.set("Retry-After", "60");
      return noStore;
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
  },

  async scheduled(controller, env) {
    const deleted = await deleteExpiredCards(env.DB, env.IMAGES, controller.scheduledTime);
    console.log({ event: "expired_cards_deleted", deleted });
  },
} satisfies ExportedHandler<Env>;
