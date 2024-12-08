import { useSubmit } from "@remix-run/react";
import Draw from "~/components/domain/draw/draw";
import { CardForm } from "~/components/domain/card/CardForm";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createCard } from "~/services/cardService";
import { AppHeader } from "~/components/common/AppHeader";

export const action = async (actionFunctionArgs: ActionFunctionArgs) => {
  try {
    const card = await createCard(actionFunctionArgs);
    return redirect(`/cards/${card.id}`);
  } catch (error) {
    return json({ error: (error as Error)?.message || "保存に失敗しました。" }, { status: 500 });
  }
};

export default function Index() {
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
    <div>
      <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50 relative">
        <AppHeader />

        <div className="bg-purple-400 p-4 text-white text-center mb-4">
          カードをつくる
        </div>
        <CardForm onSubmit={handleOnSubmit} />

        <Draw title="みんなが作ったカードを引く" />
      </div>
    </div>
  );
}