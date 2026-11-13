import { data, useActionData, useLoaderData, useSubmit, useSearchParams, useLocation } from "react-router";
import type { Route } from "./+types/cards.$id";
import { isCardId } from "~/services/http.server";
import { appContext } from "~/context.server";
import Draw from "~/components/domain/draw/draw";
import { Card3 } from "~/components/domain/card/card3/Card";
import { CardForm } from "~/components/domain/card/CardForm";
import { ResultCardImage } from "~/components/domain/card/ResultCardImage";
import { createCardAction, getCardRepository } from "~/services/cardService";
import { AppHeader } from "~/components/common/AppHeader";
import { ShareButton } from "~/components/common/ShareButton";
import { useConfetti } from "~/hooks/useConfetti";
import { useState, useEffect, useCallback } from "react";
import { AppFooter } from "~/components/common/AppFooter";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const id = params.id;
  if (!id || !isCardId(id)) {
    throw data({ message: "カードIDが指定されていません。" }, { status: 400 });
  }

  const card = await getCardRepository(context.get(appContext).cloudflare.env).getCard(id.toLowerCase());

  if (!card) {
    throw data({ message: "カードが見つかりませんでした。" }, { status: 404 });
  }

  return { card };
};

export const meta = ({ loaderData }: Route.MetaArgs) => {
  const card = loaderData?.card;
  if (!card) return [{ title: "うそポケ画像メーカー" }];
  const title = `${card?.name}のカード｜うそポケ画像メーカー`;
  const description = "嘘のぽけぽけのカードを作ってあそぼう！";
  const ogpImageUrl = `https://usopoke.asonde.me/card-ogp.png?id=${card?.id}`;

  return [
    { title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@retoruto_carry" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogpImageUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogpImageUrl },
    { property: "og:type", content: "website" },
  ];
};


export function action({ request, context }: Route.ActionArgs) {
  return createCardAction(request, context.get(appContext).cloudflare.env);
}

const CARD_WIDTH = 320;
const MOBILE_CARD_WIDTH = 320;
const MD_BREAKPOINT = 448;

export default function Card() {
  const { card } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const afterCreated = searchParams.get('created');
  const location = useLocation();
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH);

  useEffect(() => {
    if (window.innerWidth < MD_BREAKPOINT) {
      setCardWidth(MOBILE_CARD_WIDTH);
    }
  }, []);

  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const handleImageReady = useCallback(() => setRevealedCardId(card.id), [card.id]);

  const { elementIdLeft, elementIdRight } = useConfetti({
    triggerOnMount: true,
    triggerCondition: !!location.key && revealedCardId === card.id,
    lifetime: 120,
    startVelocity: 45,
  });

  const createdText = `「${card.name}」のカードを作りました\n\n#うそポケ画像メーカー\n\n↓ここからカードを動かせます！\nhttps://usopoke.asonde.me/cards/${card.id}`;
  const authorTwitterUsernameText = card.twitter_username ? `\n（カードを作った人: @${card.twitter_username}）` : '';
  const drawText = `「${card.name}」のカードを引き当てました${authorTwitterUsernameText}\n\n\n↓うそのポケポケの画像とパックを作ってみんなで遊ぼう\n#うそポケ画像メーカー\nhttps://usopoke.asonde.me/cards/${card.id}`;
  const shareText = afterCreated ? createdText : drawText;

  const handleOnSubmit = async (formData: FormData) => {
    try {
      submit(formData, {
        method: 'post',
        encType: 'multipart/form-data'
      });
    } catch (error) {
      console.error('カード画像の生成に失敗しました:', error);
      alert('カード画像の生成に失敗しました。');
    }
  };

  return (
    <div className="bg-primary relative">
      <span id={elementIdLeft} className="fixed bottom-20 left-10 z-[9999]" />
      <span id={elementIdRight} className="fixed bottom-20 right-10 z-[9999]" />

      <div className="max-w-md mx-auto p-4 min-h-screen">
        <AppHeader />
        <div className="bg-white text-primary p-4 text-center font-bold mb-4 text-lg">
          {afterCreated ? 'カードが完成しました' : 'パックの開封結果'}
        </div>

        <div className="bg-primary p-4">
          <div className="space-y-4 w-full">
            <div className="w-full flex justify-center">
              <Card3 width={cardWidth}>
                <ResultCardImage key={card.image_url} src={card.image_url} width={cardWidth} onReady={handleImageReady} />
              </Card3>
            </div>

            {card.twitter_username && (
              <div className="">
                <div className="h-5" />
                <p className="text-sm text-white text-center font-bold">
                  カードを作った人: <a href={`https://x.com/${card.twitter_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-3 ml-1"
                  >
                    @{card.twitter_username}
                  </a>
                </p>
              </div>
            )}

            <div className="h-5" />

            <div className="bg-white p-4 ">
              <ShareButton imageUrl={card.image_url} text={shareText} />

              <div className="h-5" />

              <a
                href={card.image_url}
                target="_blank"
                rel="noreferrer"
                download={`${card.name}.png`}
                className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 py-2 rounded-md flex items-center justify-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                画像をダウンロード
              </a>
              <div className="text-center text-xs text-gray-500 leading-relaxed mt-2">
                ダウンロードボタンをタップして出てきた画像を<br />
                長押しまたは右クリックで保存してください。
              </div>
            </div>
          </div>

        </div>

        <div className="h-4" />

        <Draw title="もう一度カードを引く" />

        <div className="h-8" />

        <div className="p-4 text-white text-center mb-4 font-bold text-xl">
          ↓カードをつくろう！
        </div>
        {actionData?.error && <p role="alert" className="mb-4 bg-white p-3 text-sm text-red-700">{actionData.error}</p>}
        <CardForm onSubmit={handleOnSubmit} />

        <AppFooter />
      </div>
    </div >
  );
}
