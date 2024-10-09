import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import Login from "~/components/ui/login";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  console.log("env", env);
  return json({});
}

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1>aaa</h1>
      <Login />
    </div>
  );
}