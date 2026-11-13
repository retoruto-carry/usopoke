import type { ImageStore } from "./imageStore";
import { generateRandomId } from "~/utils/generateRandomId";
import type { createServerSupabase } from "~/utils/supabase.server";

export function createSupabaseImageStore(
  supabase: ReturnType<typeof createServerSupabase>
): ImageStore {
  return {
    async uploadCardImage(image) {
      const imagePath = `public/${generateRandomId()}`;
      const bucket = supabase.storage.from("card_images");
      const { error } = await bucket.upload(imagePath, image, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        console.error("画像のアップロードに失敗しました:", error);
        throw new Error("画像のアップロードに失敗しました");
      }

      const { data: { publicUrl } } = bucket.getPublicUrl(imagePath);
      return publicUrl;
    },
  };
}
