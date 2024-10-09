import type { AppLoadContext } from "@remix-run/cloudflare";

export const getEnv = (context: AppLoadContext): Env => {
  return context.cloudflare.env as Env;
};
