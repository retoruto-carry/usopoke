import { LoaderFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createServerSupabase } from "~/utils/supabase.server";
import type { Database } from "~/types/supabase";
import Draw from "~/components/domain/draw";

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

export default function Card() {
  const { card } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl text-purple-600 mb-4">うそポケ画像メーカー</h1>

      <div className="bg-purple-400 p-4 text-white text-center mb-4">
        パックの開封結果
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <img
              src={card.image_url}
              alt="カード"
              className="w-full rounded-lg"
              loading="lazy"
            />
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
      <Draw />
    </div>
  );
}
