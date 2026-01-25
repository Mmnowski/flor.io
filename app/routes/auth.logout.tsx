import type { Route } from "./+types/auth.logout";
import { logout } from "~/lib/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }
  return logout(request);
};
