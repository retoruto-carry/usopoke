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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const formData = await request.formData();
  const { image } = Object.fromEntries(await formData);
  const imageFile = image as File;
  const randomId = generateRandomId();
  const imagePath = `public/${randomId}`;

  //  Supabase Storageに画像をアップロード
  const { error: uploadError } = await supabase.storage
    .from("card_images")
    .upload(imagePath, imageFile, {
      contentType: imageFile.type,
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error(uploadError);
    return json({ error: uploadError?.message || "画像のアップロードに失敗しました。" }, { status: 500 });
  }

  const { data: { publicUrl: imageUrl } } = await supabase.storage.from('card_images').getPublicUrl(imagePath);

  // データベースに画像のURLを保存
  const { data: card, error: dbError } = await supabase.from("card_images").insert({
    image_url: imageUrl
  }).select().single();

  if (dbError) {
    console.error(dbError);
    return json({ error: dbError.message }, { status: 500 });
  }

  if (!card) {
    return json({ error: "カードの保存に失敗しました。" }, { status: 500 });
  }

  return redirect(`/cards/${card.id}`);
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
  image: File | null;
};

// Zodスキーマの定義
const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  hp: z.string().min(1, "HPは必須です"),
  move1: z.object({
    name: z.string().min(1, "わざの名前は必須です"),
    damage: z.string().min(1, "ダメージは必須です"),
    info: z.string().min(1, "説明は必須です"),
  }),
  move2: z.object({
    name: z.string().optional(),
    damage: z.string().optional(),
    info: z.string().optional(),
  }),
  showInGallery: z.boolean(),
  agreeToTerms: z.boolean(),
  image: z.instanceof(File).optional(),
}).refine(data => !(data.showInGallery && !data.agreeToTerms), {
  message: "「みんなが作ったカード」に出現させる場合、利用規約に同意する必要があります。",
  path: ["agreeToTerms"],
});

export default function Index() {
  const [preview, setPreview] = useState(DEFAULT_IMAGE_SRC);
  const [showMove2, setShowMove2] = useState(false);
  const { register, watch, setValue, formState: { isValid, isSubmitting, errors } } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      hp: "",
      name: "",
      move1: { name: "", damage: "", info: "" },
      move2: { name: "", damage: "", info: "" },
      showInGallery: true,
      agreeToTerms: false,
      image: null,
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

        <Form method="post" className="space-y-4" encType="multipart/form-data">
          <div className="flex flex-row gap-3 items-center">
            <h3 className="flex-shrink-0">背景画像</h3>
            <Input type="file" {...register("image", { onChange: handleImageChange })} required accept="image/png, image/jpeg, image/jpg" className="flex-1" />
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <div className="flex items-center gap-2">
              <Input type="text" {...register("name")} placeholder="名前" required className="flex-1" />
              <Input type="text" {...register("hp")} placeholder="HP" required className="w-24" />
            </div>

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
                id="showInGallery"
                {...register("showInGallery")}
              />
              <label htmlFor="showInGallery" className="text-sm text-gray-700 cursor-pointer">「みんなが作ったカード」に出現させる</label>
            </div>

            <div className="ml-6">
              {formValues.showInGallery && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    {...register("agreeToTerms")}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">利用規約を守って投稿する</label>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="default"
            disabled={!isValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? '送信中...' : '完成'}
          </Button>
          {Object.values(errors).map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-2">
              {error.message}
            </p>
          ))}
        </Form>
      </div>

      <div className="mt-6 bg-purple-400 p-4 text-white text-center">
        みんなが作ったカードを引く（ランダム）
      </div>
    </div>
  );
}