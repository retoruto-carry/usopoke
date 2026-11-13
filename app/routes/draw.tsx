import { LoaderFunctionArgs, json, ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getCardServices } from "~/services/cardService";
import { useEffect } from "react";
import { useNavigate, useLoaderData } from "@remix-run/react";

type ActionResponse = {
  error?: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const card = await getCardServices({ request, context }).getRandomCard();
  if (!card) {
    throw json<ActionResponse>({ error: "不明なエラーが発生しました。" }, { status: 400 });
  }

  return json({ card });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const card = await getCardServices({ request, context }).getRandomCard();
  if (!card) {
    throw json({ message: "カードの取得に失敗しました。" }, { status: 500 });
  }

  return redirect(`/cards/${card.id}?from=draw`);
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
      <a href={`/cards/${card.id}`} className="text-purple-600 mt-16 underline text-sm">待ち切れない...？</a>
      <a href="https://donate.stripe.com/7sIcOMes0aRq8msdQQ" className="text-purple-600 mt-10 underline text-sm" target="_blank" rel="noreferrer">サーバー代を支援<small>（Google Pay / Apple Pay / クレカ）</small></a>
      <a href="https://www.amazon.co.jp/hz/wishlist/ls/2MSHR2CU894JT?ref_=wl_share" className="text-purple-600 mt-4 underline text-sm" target="_blank" rel="noreferrer">開発者にほしいものリストを送る</a>
    </div>
  );
}
