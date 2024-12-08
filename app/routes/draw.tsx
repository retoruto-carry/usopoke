import { LoaderFunctionArgs, json, ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import { useEffect } from "react";
import { useNavigate, useLoaderData } from "@remix-run/react";

type ActionResponse = {
  error?: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const { data: cards, error } = await supabase.rpc("get_random_card");
  if (error || !cards) {
    throw json<ActionResponse>({ error: "不明なエラーが発生しました。" }, { status: 400 });
  }

  return json({ card: cards[0] });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const { data: cards, error } = await supabase.rpc("get_random_card");
  if (error || !cards || !cards[0]) {
    throw json({ message: "カードの取得に失敗しました。" }, { status: 500 });
  }

  return redirect(`/cards/${cards[0].id}?from=draw`);
};

export default function Draw() {
  const { card } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/cards/${card.id}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [card.id, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <p className="text-purple-600 mt-5">カードを引いています...</p>
      <img src="/images/pack_open.gif" alt="" className="w-64" />
      <a href={`/cards/${card.id}`} className="text-purple-600 mt-20 underline text-sm">待ち切れない...？</a>
    </div>
  );
}
