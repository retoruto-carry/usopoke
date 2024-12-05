import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import { Database } from "~/types/supabase";
import { createServerSupabase } from "~/utils/supabase.server";

type ActionResponse = {
  error?: string;
  result?: Database["public"]["Tables"]["card_images"]["Row"];
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  // カードリストを取得
  const { data: cards, error } = await supabase.rpc("get_random_card");
  if (error || !cards) {
    return json<ActionResponse>({ error: "不明なエラーが発生しました。" }, { status: 400 });
  }

  return json<ActionResponse>({ result: cards[0] });
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isDrawing = navigation.state === "submitting";

  return (
    <div>
      <h1>ガチャ</h1>
      <Form method="post">
        <button type="submit" disabled={isDrawing}>
          {isDrawing ? "引いています..." : "カードを引く"}
        </button>
      </Form>

      {isDrawing && <p>ローディング中...</p>}

      {actionData?.result && (
        <div>
          <h2>結果</h2>
          <img src={actionData.result.image_url} alt="カード画像" />

          <Form method="post">
            <button type="submit">もう一度引く</button>
          </Form>
        </div>
      )}

      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
    </div>
  );
}
