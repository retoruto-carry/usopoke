import {
  Links,
  Link,
  isRouteErrorResponse,
  useRouteError,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from "react-router";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-adsense-account" content="ca-pub-7293616767912550" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = status === 404
    ? "カードが見つかりませんでした。"
    : status === 429
      ? "アクセスが集中しています。少し待ってからお試しください。"
      : "読み込みに失敗しました。時間をおいてお試しください。";
  return (
    <main className="bg-primary min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-white text-center">
      <h1 className="text-xl font-bold">{message}</h1>
      <Link to="/" className="underline">トップページに戻る</Link>
    </main>
  );
}
