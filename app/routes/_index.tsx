import { Form } from "@remix-run/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import { generateRandomId } from "~/utils/generateRandomId";
import { Card3 } from "~/components/domain/card/card3/Card";
import { CardContent } from "~/components/domain/card_content/CardContent";
import { Input } from "~/components/common/Input";
import { Button } from "~/components/common/Button";
import { Checkbox } from "~/components/common/Checkbox";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const formData = await request.formData();
  const { image } = Object.fromEntries(await formData);
  const imageFile = image as File;
  const randomId = generateRandomId();

  //  Supabase Storageに画像をアップロード
  const { error: uploadError } = await supabase.storage
    .from("card_images")
    .upload(`public/${randomId}`, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  // アップロードラーのハンドリング
  if (uploadError) {
    console.error(uploadError);
    return json({ error: uploadError.message }, { status: 500 });
  }

  return redirect(`/draw?id=${randomId}`);
};

const DEFAULT_IMAGE_SRC = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"

type FormInputs = {
  hp: string;
  name: string;
  move1: {
    name: string;
    damage: string;
    info: string;
  };
  move2: {
    name: string;
    damage: string;
    info: string;
  };
  showInGallery: boolean;
  agreeToTerms: boolean;
};

export default function Index() {
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);
  const [showMove2, setShowMove2] = useState(false);
  const { register, watch, setValue } = useForm<FormInputs>({
    defaultValues: {
      hp: "",
      name: "",
      move1: { name: "", damage: "", info: "" },
      move2: { name: "", damage: "", info: "" },
      showInGallery: true,
      agreeToTerms: true
    }
  });

  const formValues = watch();
  const moves = [
    { name: formValues.move1.name, damage: formValues.move1.damage, info: formValues.move1.info },
    { name: formValues.move2.name, damage: formValues.move2.damage, info: formValues.move2.info }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('ファイルはPNG、JPEG、またはJPG形式である必要があります。');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <h1 className="text-2xl text-purple-600 mb-4">うそポケ画像メーカー</h1>

      <div className="bg-purple-400 p-4 text-white text-center mb-4">
        カードをつくる
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="card-preview mb-6">
          <Card3 width={400}>
            <CardContent
              imageSrc={preview}
              hp={formValues.hp}
              name={formValues.name}
              moves={moves}
            />
          </Card3>
        </div>

        <Form method="post" className="space-y-4">
          <input type="file" name="image" onChange={handleImageChange} required accept="image/png, image/jpeg, image/jpg" />
          <div className="flex flex-col gap-2 max-w-md">
            <Input type="text" {...register("name")} placeholder="名前" required />
            <Input type="text" {...register("hp")} placeholder="HP" required />

            <div className="space-y-2 p-2 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2">
                <Input type="text" {...register("move1.name")} placeholder="わざの名前" required className="flex-1" />
                <Input type="text" {...register("move1.damage")} placeholder="ダメージ" required className="w-24" />
              </div>
              <Input type="text" {...register("move1.info")} placeholder="説明" required />
            </div>

            {!showMove2 && (
              <Button
                onClick={() => setShowMove2(true)}
                variant="secondary"
              >
                わざを追加
              </Button>
            )}

            {showMove2 && (
              <div className="space-y-2 relative">
                <div className="space-y-2 p-2 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Input type="text" {...register("move2.name")} placeholder="わざの名前" required className="flex-1" />
                    <Input type="text" {...register("move2.damage")} placeholder="ダメージ" required className="w-24" />
                  </div>
                  <Input type="text" {...register("move2.info")} placeholder="説明" required />
                  <div className="flex justify-center items-center">
                    <Button
                      size={"sm"}
                      variant="secondary"
                      onClick={() => {
                        setShowMove2(false);
                        // わざ2のフィールドをリセット
                        setValue("move2", { name: "", damage: "", info: "" });
                      }}
                    >
                      ✕ 削除
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register("showInGallery")}
              />
              <span className="text-sm text-gray-700">「みんなが作ったカード」に出現させる</span>
            </div>

            <div className="ml-6">
              {formValues.showInGallery && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-400"
                    {...register("agreeToTerms")}
                  />
                  <span className="text-sm text-gray-700">利用規約を守って投稿する</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="default"
            disabled={!formValues.agreeToTerms}
            type="submit"
          >
            完成
          </Button>
        </Form>
      </div>

      <div className="mt-6 bg-purple-400 p-4 text-white text-center">
        みんなが作ったカードを引く（ランダム）
      </div>
    </div>
  );
}