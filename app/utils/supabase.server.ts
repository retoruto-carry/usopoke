import { AppLoadContext } from "@remix-run/cloudflare";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Database } from "~/types/supabase";
import { getEnv } from "./getEnv.server";

export const createServerSupabase = ({
  request,
  response,
  context,
}: {
  request: Request;
  response: Response;
  context: AppLoadContext;
}) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv(context);
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    request,
    response,
  });
};
