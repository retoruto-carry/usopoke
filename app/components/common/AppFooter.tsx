import { Link } from "@remix-run/react";
import { Tweet } from 'react-twitter-widgets'
import { ClientOnly } from "remix-utils/client-only";

export const AppFooter = () => {
  return (
    <div className="text-center text-xs text-gray-500 leading-relaxed mt-16">
      <p className="text-white">任天堂さんとは一切関係ありません。完全非公式のネタサービスです</p>
      <p className="mt-4 mb-2 text-white font-medium text-lg">
        開発した人: <a href="https://x.com/retoruto_carry" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@retoruto_carry</a>
      </p>
      <p className="mb-6 text-white font-medium text-lg">
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
      <p className="mt-10 mb-2 text-white font-medium text-lg">
        <a href="https://donate.stripe.com/7sIcOMes0aRq8msdQQ" className="border-b underline underline-offset-4 underline:text-white" target="_blank" rel="noreferrer">サーバー代を支援する<small className="text-sm ml-3">(Google Pay / Apple Pay / クレカ)</small></a>
      </p>
      <p className="mt-3 mb-2 text-white font-medium text-lg">
        <a href="https://www.amazon.co.jp/hz/wishlist/ls/2MSHR2CU894JT?ref_=wl_share" className="border-b underline underline-offset-4 underline:text-white" target="_blank" rel="noreferrer">ほしいものリストを送る</a>
      </p>
      <p className="mt-10 mb-2 text-white font-medium text-lg">
        支援者のみなさま（Special thanks）
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/spinute" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@spinute</a>
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/mikkameee" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@mikkameee</a>
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/hakureifarm" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@hakureifarm</a>
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/zugaaanzubababa" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@zugaaanzubababa</a>
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/matsueng" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@matsueng</a>
      </p>
      <p className="mb-2 text-white font-medium text-lg">
        <a href="https://x.com/kabutodayo_" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@kabutodayo_(おくびょうカブト)</a>
      </p>
    </div>
  );
};