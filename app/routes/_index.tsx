import { useActionData, useSubmit } from "react-router";
import Draw from "~/components/domain/draw/draw";
import { CardForm } from "~/components/domain/card/CardForm";
import type { Route } from "./+types/_index";
import { appContext } from "~/context.server";
import { createCardAction } from "~/services/cardService";
import { AppHeader } from "~/components/common/AppHeader";
import { AppFooter } from "~/components/common/AppFooter";

export function meta(): Route.MetaDescriptors {
  const title = "うそポケ画像メーカー";
  const description = "オリジナルのうそポケカードを作ったり、みんなのカードをランダムパックから引いたりして遊べます。";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: "https://usopoke.asonde.me/" },
    { property: "og:image", content: "https://usopoke.asonde.me/images/back_of_card_with_text.png" },
  ];
}

export function action({ request, context }: Route.ActionArgs) {
  return createCardAction(request, context.get(appContext).cloudflare.env);
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

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
      <div className="max-w-md mx-auto p-4 min-h-screen">
        <AppHeader />

        <div className="p-4 text-white text-center mb-4 font-bold text-2xl">
          ↓カードをつくろう！
        </div>

        {actionData?.error && <p role="alert" className="mb-4 bg-white p-3 text-sm text-red-700">{actionData.error}</p>}
        <CardForm onSubmit={handleOnSubmit} />

        <div className="h-12" />

        <Draw title="みんなが作ったカードを引く" />

        <AppFooter />
      </div>
    </div>
  );
}
