import { data, redirect, useNavigate, useLoaderData } from "react-router";
import type { Route } from "./+types/draw";
import { appContext } from "~/context.server";
import { getCardRepository } from "~/services/cardService";
import { useEffect } from "react";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const card = await getCardRepository(context.get(appContext).cloudflare.env).getRandomCard();
  if (!card) {
    throw data({ error: "不明なエラーが発生しました。" }, { status: 400 });
  }

  return { card };
};

export const action = async ({ context }: Route.ActionArgs) => {
  const card = await getCardRepository(context.get(appContext).cloudflare.env).getRandomCard();
  if (!card) {
    throw data({ message: "カードの取得に失敗しました。" }, { status: 500 });
  }

  return redirect(`/cards/${card.id}?from=draw`);
};

export default function Draw() {
  const { card } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    const image = new Image();
    image.src = card.image_url;
    void image.decode().catch(() => {
      // The results page handles failed or incomplete preloads.
    });
  }, [card.image_url]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/cards/${card.id}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [card.id, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-primary text-white">
      <p className="text-white mt-5">カードを引いています...</p>
      <img src="/images/pack_open.gif" alt="" width={825} height={768} className="w-64 h-auto" />
      <a href={`/cards/${card.id}`} className="text-white mt-16 underline text-sm">待ち切れない...？</a>
      <a href="https://donate.stripe.com/7sIcOMes0aRq8msdQQ" className="text-white mt-10 underline text-sm" target="_blank" rel="noreferrer">サーバー代を支援<small>（Google Pay / Apple Pay / クレカ）</small></a>
      <a href="https://www.amazon.co.jp/hz/wishlist/ls/2MSHR2CU894JT?ref_=wl_share" className="text-white mt-4 underline text-sm" target="_blank" rel="noreferrer">開発者にほしいものリストを送る</a>
    </div>
  );
}
