import { useLoaderData } from "@remix-run/react";
import { supabase } from "~/utils/supabase";

export const loader = async () => {
  const { data, error } = await supabase.from("todo_list").select("*");
  console.log(data);
  return { data, error };
};

export default function Index() {
  const { data, error } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Hello xxxxxxx</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}