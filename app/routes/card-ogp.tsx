import type { Route } from "./+types/card-ogp";
import { appContext } from "~/context.server";
import { renderCardOgp } from "~/components/domain/ogp/renderCardOgp.server";
import { cardImageKeyFromPath } from "~/repositories/r2ImageStore.server";
import { getCardRepository } from "~/services/cardService";
import {
  cacheHeaders,
  defaultCache,
  canonicalCacheRequest,
  conditionalImageResponse,
  enforceRateLimit,
  isCardId,
  notFound,
  storeImageResponse,
} from "~/services/http.server";

const layoutVersion = "v2";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env, ctx } = context.get(appContext).cloudflare;
  const cardId = new URL(request.url).searchParams.get("id");
  if (!cardId || !isCardId(cardId)) {
    return new Response(cardId ? "カードIDが不正です。" : "カードIDが指定されていません。", {
      status: 400, headers: { "Cache-Control": "no-store" },
    });
  }

  const id = cardId.toLowerCase();
  const cacheKey = canonicalCacheRequest(request, `/card-ogp-cache/${layoutVersion}/${id}.png`);
  const cached = await defaultCache().match(cacheKey);
  if (cached) return conditionalImageResponse(request, cached);

  await enforceRateLimit(request, env.RATE_LIMIT_OGP, "card-ogp");
  const card = await getCardRepository(env).getCardWithExpiry(id);
  if (!card) return notFound();

  const key = cardImageKeyFromPath(card.image_url);
  if (!key) return notFound();
  const object = await env.IMAGES.get(key);
  if (!object) return notFound();

  const png = await renderCardOgp(await object.arrayBuffer());
  const headers = cacheHeaders(card.expires_at);
  headers.set("Content-Type", "image/png");
  headers.set("ETag", `"${layoutVersion}-${object.etag}"`);
  const response = new Response(png, { headers });
  storeImageResponse(ctx, cacheKey, response);
  return conditionalImageResponse(request, response);
}
