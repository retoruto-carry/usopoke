import { data, redirect } from "react-router";
import { createD1CardRepository } from "~/repositories/d1CardRepository.server";
import { createR2ImageStore } from "~/repositories/r2ImageStore.server";
import { CardInputError, parseCardSubmission } from "./cardValidation.server";
import { enforceRateLimit } from "./http.server";

export function getCardRepository(env: Env) {
  return createD1CardRepository(env.DB);
}

export async function createCardAction(request: Request, env: Env) {
  const headers = { "Cache-Control": "no-store" };

  try {
    await enforceRateLimit(request, env.RATE_LIMIT_WRITE, "card-write");
    const { data: submission, image } = await parseCardSubmission(request);
    const image_url = await createR2ImageStore(env.IMAGES).uploadCardImage(image);
    try {
      const card = await getCardRepository(env).insertCard({ ...submission, image_url });
      return redirect(`/cards/${card.id}?created=true`, { headers });
    } catch (error) {
      // A failed request can leave the insert committed. Keep its image available for that case.
      console.error({ event: "card_insert_failed", imagePath: image_url, error });
      return data({ error: "保存に失敗しました。" }, { status: 500, headers });
    }
  } catch (error) {
    if (error instanceof CardInputError) {
      return data({ error: error.message }, { status: error.status, headers });
    }
    if (error instanceof Response) {
      return data({ error: await error.text() }, { status: error.status, headers: error.headers });
    }
    console.error({ event: "card_create_failed", error });
    return data({ error: "保存に失敗しました。" }, { status: 500, headers });
  }
}
