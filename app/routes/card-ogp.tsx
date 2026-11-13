import { ImageResponse } from "cf-workers-og/workerd";
import type { Route } from "./+types/card-ogp";
import { appContext } from "~/context.server";
import { CardOgp } from "~/components/domain/ogp/CardOgp";
import { getCardServices } from "~/services/cardService";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const cardId = url.searchParams.get("id");

  if (!cardId) {
    return new Response("カードIDが指定されていません。", { status: 400 });
  }

  const card = await getCardServices({
    request,
    context: context.get(appContext),
  }).getCard(cardId);

  if (!card) {
    return new Response("カードが見つかりませんでした。", { status: 400 });
  }

  return ImageResponse.create(
    <CardOgp imageUrl={card.image_url} />,
    {
      width: 1200,
      height: 630,
      headers: {
        'content-type': 'image/png',
      },
    }
  );
};
