import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { CardOgp } from "~/components/domain/ogp/CardOgp";
import { getCardServices } from "~/services/cardService";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const cardId = url.searchParams.get("id");

  if (!cardId) {
    return new Response("カードIDが指定されていません。", { status: 400 });
  }

  const card = await getCardServices({
    request,
    context: { cloudflare: { env } },
  }).getCard(cardId);

  if (!card) {
    return new Response("カードが見つかりませんでした。", { status: 400 });
  }

  const Context = () => {
    return <CardOgp imageUrl={card.image_url} />;
  };

  return new ImageResponse(
    <Context />,
    {
      width: 1200,
      height: 630,
      headers: {
        'content-type': 'image/png',
      },
    }
  );
};
