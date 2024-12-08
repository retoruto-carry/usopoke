import { Link } from "@remix-run/react";

export const AppFooter = () => {
  return (
    <div className="text-center text-xs text-gray-500 leading-relaxed mt-16">
      <p className="mb-2 text-white">任天堂さんとは一切関係ありません。完全非公式のネタサービスです</p>
      <p className="mb-2 text-white">
        作った人: <a href="https://twitter.com/retoruto_carry" className="border-b border-gray-500 border-dotted" target="_blank" rel="noreferrer">@retoruto_carry</a>
      </p>
      <Link to="/">
        <div className="flex items-center mb-4">
          <img src="/images/pack.gif" alt="" className="h-32 mr-2" />
          <h1 className="text-2xl text-white font-bold">うそポケ画像メーカー</h1>
        </div>
      </Link>
    </div>
  );
};