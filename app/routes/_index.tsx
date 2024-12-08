import { useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import Draw from "~/components/domain/draw/draw";
import { uploadCardToSupabase } from "~/services/supabase/cards";
import { CardForm } from "~/components/domain/card/CardForm";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const formData = await request.formData();
  const {
    image,
    name,
    hp,
    move1_name,
    move1_damage,
    move1_info,
    move2_name,
    move2_damage,
    move2_info,
    show_in_gallery,
  } = Object.fromEntries(formData);

  try {
    const card = await uploadCardToSupabase({
      supabase,
      data: {
        imageFile: image as File,
        name: name as string,
        hp: hp as string,
        move1_name: move1_name as string,
        move1_damage: move1_damage as string,
        move1_info: move1_info as string,
        move2_name: move2_name as string,
        move2_damage: move2_damage as string,
        move2_info: move2_info as string,
        show_in_gallery: show_in_gallery === "true"
      }
    });
    return redirect(`/cards/${card.id}`);
  } catch (error) {
    return json({ error: "画像の保存に失敗しました。" }, { status: 500 });
  }
};

export default function Index() {
  const submit = useSubmit();

  const handleOnSubmit = async (formData: FormData) => {
    try {
      submit(formData, {
        method: 'post',
        encType: 'multipart/form-data'
      });
    } catch (error) {
      console.error('カード画像の生成に失敗しました:', error);
      alert('カード画像の生成に失敗しました。');
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50 relative">

        <h1 className="text-2xl text-purple-600 mb-4">うそポケ画像メーカー</h1>

        <div className="bg-purple-400 p-4 text-white text-center mb-4">
          カードをつくる
        </div>
        <CardForm onSubmit={handleOnSubmit} />

        <Draw title="みんなが作ったカードを引く" />
      </div>
    </div>
  );
}