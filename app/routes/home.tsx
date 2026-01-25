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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Your AI Plant Care Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Never forget to water your plants again. Get smart watering reminders and AI-powered care tips.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/auth/register">
            <Button
              size="lg"
              className="text-lg px-8 bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-2 focus:ring-emerald-300"
            >
              Get Started Free
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-300"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Watering</h3>
            <p className="text-gray-600 leading-relaxed">
              Get timely reminders based on your plant's needs and your location.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Identify plants with your camera and get personalized care instructions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Growth</h3>
            <p className="text-gray-600 leading-relaxed">
              Keep records of your plants and monitor their health over time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to become a plant parent?</h2>
          <p className="text-lg mb-8 opacity-90 leading-relaxed">
            Create your free account and start tracking your plants today.
          </p>
          <Link to="/auth/register">
            <Button
              size="lg"
              className="text-lg px-8 bg-white text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-300"
            >
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
