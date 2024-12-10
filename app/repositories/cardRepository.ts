import { createServerSupabase } from "~/utils/supabase.server";
import { generateRandomId } from "~/utils/generateRandomId";

type UploadCardOptions = {
  supabase: ReturnType<typeof createServerSupabase>;
  data: {
    imageFile: File;
    name: string;
    hp: string;
    move1_name: string;
    move1_damage: string;
    move1_info: string;
    move2_name: string;
    move2_damage: string;
    move2_info: string;
    show_in_gallery: boolean;
    twitter_username: string | null;
  }
};

export async function uploadCardToSupabase({
  supabase,
  data,
}: UploadCardOptions) {
  const randomId = generateRandomId();
  const imagePath = `public/${randomId}`;

  // 画像をSupabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from("card_images")
    .upload(imagePath, data.imageFile, {
      contentType: data.imageFile.type,
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('画像のアップロードに失敗しました:', uploadError);
    throw new Error('画像のアップロードに失敗しました');
  }

  // 画像の公開URLを取得
  const { data: { publicUrl: imageUrl } } = await supabase.storage
    .from('card_images')
    .getPublicUrl(imagePath);

  // データベースに画像の情報を挿入
  const { data: card, error: dbError } = await supabase.from("cards").insert({
    image_url: imageUrl,
    name: data.name,
    hp: data.hp,
    move1_name: data.move1_name,
    move1_damage: data.move1_damage,
    move1_info: data.move1_info,
    move2_name: data.move2_name,
    move2_damage: data.move2_damage,
    move2_info: data.move2_info,
    show_in_gallery: data.show_in_gallery,
    twitter_username: data.twitter_username,
  }).select().single();

  if (dbError) {
    console.error('データベースの保存に失敗しました:', dbError);
    throw new Error('データベースの保存に失敗しました');
  }

  if (!card) {
    throw new Error('画像の保存に失敗しました。');
  }

  return card;
}
