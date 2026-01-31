import { loginUser } from '~/lib/auth/auth.server';
import { createUserSession, getUserId } from '~/lib/auth/session.server';
import { Button, Card, FormError, Input, Label } from '~/shared/components';

import { Form, Link, redirect, useActionData } from 'react-router';

import { Leaf } from 'lucide-react';

import type { Route } from './+types/auth.login';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/dashboard');
  }
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    return { error: null as string | null };
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || typeof email !== 'string') {
      return { error: 'Email is required' };
    }

    if (!password || typeof password !== 'string') {
      return { error: 'Password is required' };
    }

    const session = await loginUser(email, password);

    if (!session?.user?.id) {
      return { error: 'Email address or password is incorrect' };
    }

    return createUserSession(session.user.id, session.user.email);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return { error: message };
  }
};

export default function LoginPage() {
  const actionData = useActionData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <Card className="w-full max-w-md shadow-lg border border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900">
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-800">
              <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome to <span className="text-emerald-600 dark:text-emerald-400">Flor</span>
            <span className="text-slate-700 dark:text-white">.io</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
            Sign in to your plant care companion
          </p>

          <FormError message={actionData?.error} />

          <Form method="post" className="space-y-5">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full h-11 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-4 py-2 text-base placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full h-11 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-4 py-2 text-base placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-base font-medium rounded-lg focus:ring-2 focus:ring-emerald-300"
              size="lg"
            >
              Sign in
            </Button>
          </Form>

          <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6 leading-relaxed">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors focus:ring-2 focus:ring-emerald-300 rounded px-1 focus:outline-none"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
