import { Form } from "@remix-run/react";
import { useState } from "react";
import { Input } from "~/components/common/input";
import Login from "~/components/common/login";
import { Card3 } from "~/components/domain/card/card3/Card";
import { CardContent } from "~/components/domain/card_content/CardContent";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import { requireUser } from "~/utils/auth.server";
import { generateRandomId } from "~/utils/generateRandomId";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const formData = await request.formData();
  const { image } = Object.fromEntries(await formData);
  const imageFile = image as File;

  const user = await requireUser({ request, context });
  const uid = user.id;

  const randomId = generateRandomId();

  //  Supabase Storageに画像をアップロード
  const { error: uploadError, data: imageData } = await supabase.storage
    .from("card_images")
    .upload(`${uid}/${randomId}`, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  // アップロードエラーのハンドリング
  if (uploadError) {
    console.error(uploadError);
    return json({ error: uploadError.message }, { status: 500 });
  }

  // データベースに画像のURLを保存
  const imageUrl = imageData?.fullPath;
  const { error: dbError } = await supabase.from("card_images").insert({
    image_url: imageUrl
  });

  // データベースエラーのハンドリング
  if (dbError) {
    console.error(dbError);
    return json({ error: dbError.message }, { status: 500 });
  }

  // 成功時のレスポンスをリダイレクトに変更
  return redirect('/success-page');
}

export default function Editor() {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [moves, setMoves] = useState([{ name: "", damage: "", info: "" }, { name: "", damage: "", info: "" }]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Login />
      <Form method="post" encType="multipart/form-data">
        <input type="file" name="image" onChange={handleImageChange} required />
        <div className="flex flex-col gap-2 max-w-md">
          <Input type="text" name="hp" placeholder="HP" onChange={e => setHp(e.target.value)} value={hp} required />
          <Input type="text" name="name" placeholder="名前" onChange={e => setName(e.target.value)} value={name} required />
          <Input type="text" name="move1-name" placeholder="わざ1" onChange={e => setMoves(prev => [{ ...prev[0], name: e.target.value }, prev[1]])} value={moves[0].name} required />
          <Input type="text" name="move1-damage" placeholder="ダメージ" onChange={e => setMoves(prev => [{ ...prev[0], damage: e.target.value }, prev[1]])} value={moves[0].damage} required />
          <Input type="text" name="move1-info" placeholder="説明" onChange={e => setMoves(prev => [{ ...prev[0], info: e.target.value }, prev[1]])} value={moves[0].info} required />
          <Input type="text" name="move2-name" placeholder="わざ2" onChange={e => setMoves(prev => [prev[0], { ...prev[1], name: e.target.value }])} value={moves[1].name} />
          <Input type="text" name="move2-damage" placeholder="ダメージ" onChange={e => setMoves(prev => [prev[0], { ...prev[1], damage: e.target.value }])} value={moves[1].damage} />
          <Input type="text" name="move2-info" placeholder="説明" onChange={e => setMoves(prev => [prev[0], { ...prev[1], info: e.target.value }])} value={moves[1].info} />
        </div>

        <div className="flex justify-center">
          <Card3 width={400}>
            <CardContent imageSrc={preview} hp={hp} name={name} moves={moves} />
          </Card3>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mt-10">アップロード</button>

      </Form>
    </>
  )
}