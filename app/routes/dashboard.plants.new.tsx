import { Link } from "react-router";
import type { Route } from "./+types/dashboard.plants.new";
import { Button } from "~/components/ui/button";

export default function NewPlant() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/dashboard">
        <Button variant="outline" className="mb-4">
          ← Back
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-4">Add Plant</h1>
      {/* Form will be implemented in Phase 2 */}
    </div>
  );
}
