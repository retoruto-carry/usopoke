import { createSupabaseCardRepository } from "~/repositories/supabaseCardRepository.server";
import { createSupabaseImageStore } from "~/repositories/supabaseImageStore.server";
import type { CreateCardData } from "~/types/card";
import { createServerSupabase } from "~/utils/supabase.server";

type CardServiceArgs = {
  request: Request;
  context: {
    cloudflare: { env: Env };
  };
};

export function getCardServices({ request, context }: CardServiceArgs) {
  const supabase = createServerSupabase({
    request,
    response: new Response(),
    env: context.cloudflare.env,
  });
  const cards = createSupabaseCardRepository(supabase);
  const images = createSupabaseImageStore(supabase);

  return {
    getCard: (id: string) => cards.getCard(id),
    getRandomCard: () => cards.getRandomCard(),
    async createCard(data: CreateCardData, image: File) {
      const image_url = await images.uploadCardImage(image);
      return cards.insertCard({ ...data, image_url });
    },
  };
}

export async function createCard({ request, context }: CardServiceArgs) {
  const cards = getCardServices({ request, context });
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
    twitter_username,
  } = Object.fromEntries(formData);

  const data: CreateCardData = {
    name: name as string,
    hp: hp as string,
    move1_name: move1_name as string,
    move1_damage: move1_damage as string,
    move1_info: move1_info as string,
    move2_name: move2_name as string,
    move2_damage: move2_damage as string,
    move2_info: move2_info as string,
    show_in_gallery: show_in_gallery === "true",
    twitter_username: (twitter_username as string | undefined)?.trim() || null,
  };
  return cards.createCard(data, image as File);
}
