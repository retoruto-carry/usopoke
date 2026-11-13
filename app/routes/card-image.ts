import type { Route } from "./+types/card-image";
import { appContext } from "~/context.server";
import { cardImageKeyFromPath, cardImagePath } from "~/repositories/r2ImageStore.server";
import { getCardRepository } from "~/services/cardService";
import {
  cacheHeaders,
  defaultCache,
  canonicalCacheRequest,
  conditionalImageResponse,
  enforceRateLimit,
  notFound,
  storeImageResponse,
} from "~/services/http.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env, ctx } = context.get(appContext).cloudflare;
  const imageKey = cardImageKeyFromPath(new URL(request.url).pathname);
  if (!imageKey) return notFound();

  const cacheKey = canonicalCacheRequest(request, cardImagePath(imageKey));
  const cached = await defaultCache().match(cacheKey);
  if (cached) return conditionalImageResponse(request, cached);

  await enforceRateLimit(request, env.RATE_LIMIT_READ, "card-read");
  const card = await getCardRepository(env).getCardImageExpiry(imageKey);
  if (!card) return notFound();

  const object = request.method === "HEAD" ? await env.IMAGES.head(imageKey) : await env.IMAGES.get(imageKey);
  if (!object) return notFound();

  const headers = cacheHeaders(card.expires_at);
  headers.set("Content-Type", "image/png");
  headers.set("Content-Length", String(object.size));
  headers.set("ETag", object.httpEtag);
  const response = new Response("body" in object ? object.body as ReadableStream : null, { headers });
  if (request.method === "GET") storeImageResponse(ctx, cacheKey, response);
  return conditionalImageResponse(request, response);
}
