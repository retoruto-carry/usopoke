import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useNavigation, Form, useActionData } from "@remix-run/react";
import { Database } from "~/types/supabase";
import { createServerSupabase } from "~/utils/supabase.server";

type LoaderData = {
  card: Database["public"]["Tables"]["card_images"]["Row"] | null;
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return json<LoaderData>({ card: null });
  }

  const { data: card, error } = await supabase
    .from("card_images")
    .select()
    .eq("id", id)
    .single();


  if (error || !card) {
    throw new Error("カードが見つかりませんでした。");
  }

  return json<LoaderData>({ card });
};

type ActionResponse = {
  error?: string;
};

export const action: ActionFunction = async ({ request, context }) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  // ランダムなカードを取得
  const { data: cards, error } = await supabase.rpc("get_random_card");

  if (error || !cards || cards.length === 0) {
    throw new Error("カードを取得できませんでした。");
  }

  const selectedCard = cards[0];
  return redirect(`/draw?id=${selectedCard.id}`);
};

export default function Index() {
  const { card } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  console.log(card);

  return (
    <div>
      <h1>ガチャ</h1>
      <Form method="post">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "引いています..." : "カードを引く"}
        </button>
      </Form>

      {isSubmitting && <p>ローディング中...</p>}

      {card && (
        <div>
          <h2>結果</h2>
          <img src={card.image_url} alt="カード画像" />
          <Form method="post">
            <button type="submit">もう一度引く</button>
          </Form>
        </div>
      )}

      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
    </div>
  );
}
