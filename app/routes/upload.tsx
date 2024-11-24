import { Form } from "@remix-run/react";
import { useState } from "react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import { Card } from "~/components/domain/card/card/Card";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const formData = await request.formData();
  const { image } = Object.fromEntries(await formData);
  const imageFile = image as File;

  // Supabase Storageに画像をアップロード
  const { data, error: uploadError } = await supabase.storage
    .from("card_images")
    .upload(`public/${imageFile.name}`, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  // アップロードエラーのハンドリング
  if (uploadError) {
    console.error(uploadError);
    return json({ error: uploadError.message }, { status: 500 });
  }

  // データベースに画像のURLを保存
  const imageUrl = data?.fullPath;
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

export default function Upload() {
  const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);

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
    <Form method="post" encType="multipart/form-data">
      <input type="file" name="image" onChange={handleImageChange} />
      <Card imageSrc={preview} />
      <button type="submit">アップロード</button>
    </Form>
  )
}