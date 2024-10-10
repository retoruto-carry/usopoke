import { AppLoadContext, redirect } from "@remix-run/cloudflare";
import { createServerSupabase } from "./supabase.server";

const REDIRECT_NONE_AUTHENTICATED_PATH = "/";

export async function requireUser({ request, context }: {
  request: Request;
  context: AppLoadContext;
}) {
  const response = new Response();
  const supabase = createServerSupabase({ request, response, context });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    // ユーザーが認証されていない場合は、ログインページにリダイレクト
    throw redirect(REDIRECT_NONE_AUTHENTICATED_PATH);
  }

  return session.user;
}