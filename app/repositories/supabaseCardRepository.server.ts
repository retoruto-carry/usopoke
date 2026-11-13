import type { CardRepository } from "./cardRepository";
import type { createServerSupabase } from "~/utils/supabase.server";

export function createSupabaseCardRepository(
  supabase: ReturnType<typeof createServerSupabase>
): CardRepository {
  return {
    async getCard(id) {
      const { data, error } = await supabase.from("cards").select().eq("id", id).single();
      return error ? null : data;
    },

    async getRandomCard() {
      const { data, error } = await supabase.rpc("get_random_card");
      return error ? null : (data?.[0] ?? null);
    },

    async insertCard(data) {
      const { data: card, error } = await supabase.from("cards").insert(data).select().single();

      if (error) {
        console.error("データベースの保存に失敗しました:", error);
        throw new Error("データベースの保存に失敗しました");
      }

      if (!card) {
        throw new Error("画像の保存に失敗しました。");
      }

      return card;
    },
  };
}
