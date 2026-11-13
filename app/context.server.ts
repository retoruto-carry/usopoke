import { createContext } from "react-router";

export const appContext = createContext<{
  cloudflare: { env: Env; ctx: ExecutionContext };
}>();
