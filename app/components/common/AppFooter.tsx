import { Link } from "@remix-run/react";
import { Tweet } from 'react-twitter-widgets'
import { ClientOnly } from "remix-utils/client-only";

export const AppFooter = () => {
  return (
    <div className="text-center text-xs text-gray-500 leading-relaxed mt-16">
      <p className="mb-2 text-white">任天堂さんとは一切関係ありません。完全非公式のネタサービスです</p>
      <p className="mb-2 text-white font-medium text-md">
        開発した人: <a href="https://x.com/retoruto_carry" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@retoruto_carry</a>
      </p>
      <p className="mb-2 text-white font-medium text-md">
        絵を描いた人: <a href="https://x.com/kiyonagarin" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@kiyonagarin</a>
      </p>
      <Link to="/">
        <div className="flex items-center mb-4">
          <img src="/images/pack.gif" alt="" className="h-32 mr-2" />
          <h1 className="text-2xl text-white font-bold">うそポケ画像メーカー</h1>
        </div>
      </Link>
      <div className="mt-10">
        <p className="text-white font-bold text-center text-lg">↓こんなサービスも作ってます</p>
        <p className="text-white text-center text-xs mt-2">RTお願いします🙏</p>
        <div className="items-center justify-center mt-4 w-full">
          <ClientOnly>
            {() => <Tweet
              tweetId={'1796123557090517067'}
            />}
          </ClientOnly>
        </div>
      </div>
      <p className="mt-10 mb-2 text-white font-medium text-md">
        Special thanks(サーバー代のご支援)
      </p>
      <p className="mb-2 text-white font-medium text-md">
        <a href="https://x.com/spinute" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@spinute</a>
      </p>
      <p className="mb-2 text-white font-medium text-md">
        <a href="https://x.com/mikkameee" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@mikkameee</a>
      </p>
      <p className="mb-2 text-white font-medium text-md">
        <a href="https://x.com/zugaaanzubababa" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@zugaaanzubababa</a>
      </p>
    </div>
  );
};