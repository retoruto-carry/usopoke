import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, context });
  return json({ user });
};

export default function MyPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Register</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}