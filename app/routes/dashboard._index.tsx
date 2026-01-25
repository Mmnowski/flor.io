import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard._index";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/empty-state";
import { Plus, Leaf } from "lucide-react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // TODO: Fetch plants from Supabase
  return { plants: [] as [] };
};

export default function DashboardIndex() {
  const { plants } = useLoaderData() as { plants: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Plants</h1>
          <p className="text-gray-600">Track and manage your plant collection</p>
        </div>
        <Link to="/dashboard/plants/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Plant
          </Button>
        </Link>
      </div>

      {plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No plants yet"
          description="Start by adding your first plant to track its watering schedule"
          actionLabel="Add Plant"
          onAction={() => {}}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Plant cards will go here */}
        </div>
      )}
    </div>
  );
}
