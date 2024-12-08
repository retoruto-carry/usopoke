import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { CardOgp } from "~/components/domain/ogp/CardOgp";
import { Database } from "~/types/supabase";

export const onRequest: PagesFunction = async (context) => {
  const env = context.env as unknown as Env;

  const supabase = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      request: context.request,
      response: new Response(),
    }
  );

  const url = new URL(context.request.url);
  const cardId = url.searchParams.get("id");

  if (!cardId) {
    return new Response("カードIDが指定されていません。", { status: 400 });
  }

  const { error, data } = await supabase
    .from("cards")
    .select()
    .eq("id", cardId)
    .single();

  if (error || !data) {
    return new Response("カードが見つかりませんでした。", { status: 400 });
  }

  const Context = () => {
    return <CardOgp imageUrl={data.image_url} />;
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
