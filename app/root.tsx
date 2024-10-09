import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import createServerSupabase from "./utils/supabase.server";

import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import "./tailwind.css";
import { useEffect, useState } from "react";
import { Database } from "./types/supabase";
import { createBrowserClient, SupabaseClient } from "@supabase/auth-helpers-remix";

const SUPABASE_URL = "https://lyfolpqxqktrbmnuhghc.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Zm9scHF4cWt0cmJtbnVoZ2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzODczODUsImV4cCI6MjA0Mzk2MzM4NX0.T7-Y6q3tBmfDWDq5scg1bMK7HA5j49tHxrPywr6YzrI"

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: SUPABASE_URL!,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createServerSupabase({ request, response });


  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log({ client: { session } });

  return json({ env, session }, { headers: response.headers });
};

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();

  console.log({ server: { session } });

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then((session) => console.log({ client: { session } }));
  }, []);


  return <Outlet context={{ supabase }} />;
}
