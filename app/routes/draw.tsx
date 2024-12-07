import { LoaderFunction, json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { createServerSupabase } from "~/utils/supabase.server";
import type { Database } from "~/types/supabase";

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

export default function Draw() {
  const { card } = useLoaderData<LoaderData>();
  const [isOpened, setIsOpened] = useState(false);
  const navigate = useNavigate();

  const handleDrawAgain = () => {
    setIsOpened(false);
    navigate("/draw");
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl text-purple-600 mb-4">うそポケ画像メーカー</h1>

      <div className="bg-purple-400 p-4 text-white text-center mb-4">
        パックの開封結果
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        {isOpened ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <img
                src={card?.image_url}
                alt="カード"
                className="w-full rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center">
              <button className="text-yellow-400 text-2xl">★</button>
              <button
                onClick={handleDrawAgain}
                className="text-gray-400 text-2xl"
              >
                ↻
              </button>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-md">
              X ポスト
            </button>

            <button className="w-full border border-gray-200 py-2 rounded-md">
              ↓ 画像DL
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cursor-pointer text-center"
            onClick={() => setIsOpened(true)}
          >
            <img
              src="/pack.png"
              alt="パック"
              className="mx-auto mb-2 w-48"
            />
            <p className="text-purple-600">▲ タップしてパックを開封</p>
          </button>
        )}
      </div>

      <div className="mt-6 bg-purple-400 p-4 text-white text-center">
        もう一度カードを引く（ランダム）
      </div>
    </div>
  );
}
