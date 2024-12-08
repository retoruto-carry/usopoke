import { Link } from "@remix-run/react";

export const AppHeader = () => {
  return (
    <Link to="/">
      <div className="flex items-center mb-4">
        <img src="/images/pack.gif" alt="" className="h-14 mr-2" />
        <h1 className="text-2xl text-purple-600 font-bold">うそポケ画像メーカー</h1>
      </div>
    </Link>
  );
};