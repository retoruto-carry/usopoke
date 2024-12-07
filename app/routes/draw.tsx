import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";

type ActionResponse = {
  error?: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  // カードリストを取得
  const { data: cards, error } = await supabase.rpc("get_random_card");
  if (error || !cards) {
    return json<ActionResponse>({ error: "不明なエラーが発生しました。" }, { status: 400 });
  }

  return redirect(`/cards/${cards[0].id}`);
};
