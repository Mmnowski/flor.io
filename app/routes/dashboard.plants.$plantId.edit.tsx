import { Link } from "react-router";
import type { Route } from "./+types/dashboard.plants.$plantId.edit";
import { Button } from "~/components/ui/button";

export const loader = async ({ params }: Route.LoaderArgs) => {
  // TODO: Fetch plant from Supabase
  return { plant: null };
};

export default function EditPlant() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/dashboard">
        <Button variant="outline" className="mb-4">
          ← Back
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-4">Edit Plant</h1>
      {/* Edit form will be implemented in Phase 2 */}
    </div>
  );
}
