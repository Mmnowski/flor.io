import { Link, redirect } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Leaf, Droplets, Brain } from "lucide-react";
import { getUserId } from "~/lib/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/dashboard");
  }
  return null;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flor - Plant Care Companion" },
    { name: "description", content: "Track and manage your plant care with AI-powered insights" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Your AI Plant Care Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Never forget to water your plants again. Get smart watering reminders and AI-powered care tips.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <Droplets className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Watering</h3>
            <p className="text-gray-600">
              Get timely reminders based on your plant's needs and your location.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <Brain className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-600">
              Identify plants with your camera and get personalized care instructions.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <Leaf className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Growth</h3>
            <p className="text-gray-600">
              Keep records of your plants and monitor their health over time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to become a plant parent?</h2>
          <p className="text-lg mb-8 opacity-90">
            Create your free account and start tracking your plants today.
          </p>
          <Link to="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
