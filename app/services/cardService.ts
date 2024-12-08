import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { createServerSupabase } from "~/utils/supabase.server";
import { uploadCardToSupabase } from "~/repositories/cardRepository";

export const createCard = async ({ request, context }: ActionFunctionArgs) => {
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

  return card;
};
