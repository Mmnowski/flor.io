import { Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "./+types/auth.register";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import { FormError } from "~/components/form-error";
import { registerUser } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/dashboard");
  }
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return { error: null as string | null };
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!email || typeof email !== "string") {
      return { error: "Email is required" };
    }

    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }

    if (!password || typeof password !== "string") {
      return { error: "Password is required" };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    const user = await registerUser(email, password);

    if (!user?.id) {
      return { error: "Failed to create account" };
    }

    return createUserSession(user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    if (message.includes("already registered")) {
      return { error: "This email is already registered" };
    }
    return { error: message };
  }
};

export default function RegisterPage() {
  const actionData = useActionData() as { error: string | null } | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 mb-6">
            Join Flor to start tracking your plants
          </p>

          <FormError message={actionData?.error} />

          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </Form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
