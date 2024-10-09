import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createServerSupabase } from "./utils/supabase.server";

import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";

import "./tailwind.css";
import { useEffect, useState } from "react";
import { Database } from "./types/supabase";
import { createBrowserClient, SupabaseClient } from "@supabase/auth-helpers-remix";
import { getEnv } from "./utils/getEnv.server";

type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
};

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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv(context);
  const env = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  };

  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
};

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== serverAccessToken) {
        revalidator.revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [revalidator, serverAccessToken, supabase.auth]);


  return <Outlet context={{ supabase }} />;
}
