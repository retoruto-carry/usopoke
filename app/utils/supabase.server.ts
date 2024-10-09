import { createServerClient } from "@supabase/auth-helpers-remix";
import { Database } from "~/types/supabase";

const SUPABASE_URL = "https://lyfolpqxqktrbmnuhghc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Zm9scHF4cWt0cmJtbnVoZ2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzODczODUsImV4cCI6MjA0Mzk2MzM4NX0.T7-Y6q3tBmfDWDq5scg1bMK7HA5j49tHxrPywr6YzrI";

export default ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) =>
  createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    request,
    response,
  });
