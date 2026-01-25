import { Outlet } from "react-router";
import type { Route } from "./+types/dashboard";
import { requireAuth } from "~/lib/require-auth.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);
  return { userId };
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}
