import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";

import Login from "~/components/ui/login";
import { createServerSupabase } from "~/utils/supabase.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const { data } = await supabase.from("todo_list").select();
  return json({ todo_list: data ?? [] }, { headers: response.headers });
};

export default function Index() {
  const { todo_list } = useLoaderData<typeof loader>();
  return (
    <>
      <Login />
      <pre>{JSON.stringify(todo_list, null, 2)}</pre>
    </>
  );
}