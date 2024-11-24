import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, json, useLoaderData } from "@remix-run/react";

import Login from "~/components/common/login";
import { createServerSupabase } from "~/utils/supabase.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });
  const { name } = Object.fromEntries(await request.formData());
  const { error } = await supabase.from("todo_list").insert({ name: String(name) });
  if (error) {
    console.error(error);
  }
  return json(null, { headers: response.headers });
};

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
      <Form method="post">
        <input type="text" name="name" />
        <button type="submit">投稿</button>
      </Form>
    </>
  );
}