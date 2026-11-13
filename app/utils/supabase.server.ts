import { createServerClient } from "@supabase/auth-helpers-remix";
import type { Database } from "~/types/supabase";

export const createServerSupabase = ({
  request,
  response,
  env,
}: {
  request: Request;
  response: Response;
  env: Pick<Env, "SUPABASE_URL" | "SUPABASE_ANON_KEY">;
}) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    request,
    response,
  });
};
