import { createRequestHandler, RouterContextProvider } from "react-router";
import { appContext } from "~/context.server";

const handleRequest = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(appContext, { cloudflare: { env, ctx } });
    return handleRequest(request, context);
  },
} satisfies ExportedHandler<Env>;
