import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { createServerSupabase } from "~/utils/supabase.server";
import type { Database } from "~/types/supabase";
import Draw from "~/components/domain/draw/draw";
import { Card3 } from "~/components/domain/card/card3/Card";

type LoaderData = {
  card: Database["public"]["Tables"]["card_images"]["Row"];
};

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const id = params.id;
  if (!id) {
    throw json({ message: "カードIDが指定されていません。" }, { status: 400 });
  }

  const { data: card, error } = await supabase.from("card_images").select().eq("id", id).single();

  if (error || !card) {
    throw json({ message: "カードが見つかりませんでした。" }, { status: 404 });
  }

  return json<LoaderData>({ card });
};

const CARD_WIDTH = 360;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export default function Card() {
  const { card } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <Link to="/">
        <h1 className="text-2xl text-purple-600 mb-4">うそポケ画像メーカー</h1>
      </Link>

      <div className="bg-purple-400 p-4 text-white text-center mb-4">
        パックの開封結果
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center">
            <div>
              <Card3 width={CARD_WIDTH}>
                <img
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  src={card.image_url}
                  alt="カード"
                  className="w-full rounded-lg"
                  loading="lazy"
                />
              </Card3>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button className="text-yellow-400 text-2xl">★</button>
          </div>

          <button className="w-full bg-black text-white py-2 rounded-md">
            X ポスト
          </button>

          <button className="w-full border border-gray-200 py-2 rounded-md">
            ↓ 画像DL
          </button>
        </div>

      </div>

      <Draw title="もう一度カードを引く" />
    </div>
  );
}
