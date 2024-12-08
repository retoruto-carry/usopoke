import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "利用規約 | Flashcard" }];
};

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">利用規約</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">🎯 お願いすること</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>みんなが使うサービスなので、過激な表現は控えめにしてください</li>
            <li>他のひとの迷惑になることはやめましょう</li>
            <li>著作権など、他の人の権利は大切にしましょう</li>
            <li>お子さんでも安心して見られる内容にしてください</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">🙇‍♂️ お詫びと免責</h2>
          <p className="mb-2">
            一生懸命作りましたが、完璧なサービスではないので...
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>このサービスは３日でつくりました</li>
            <li>予告なく機能が変わったりサービスが終了することがあります</li>
            <li>サービスの内容は保証できないので、その点はご了承ください</li>
            <li>サービスの利用によって生じた損害について、責任を負いかねます</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">🔒 プライバシーについて</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>法律で必要な場合を除いて、他の人に情報を渡すことはありません</li>
            <li>AI学習は禁止です。本サービスがAI学習をすることは今後もありません</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">💬 お問い合わせ</h2>
          <p>
            質問・要望・バグ報告などありましたら、Twitter: <a href="https://twitter.com/retoruto_carry" className="text-blue-600 hover:underline">@retoruto_carry</a> にDMやリプライでお気軽にどうぞ
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">📝 規約の更新について</h2>
          <p>
            この規約はアップデートすることがあります
          </p>
        </section>
      </div>
    </div>
  );
}
