import { Navigation } from '~/layout/components';
import { getUserId } from '~/lib/auth';
import { NavigationProgressBar } from '~/shared/components';

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);
  return { userId };
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Flor - Plant Care Companion</title>
        <meta
          name="description"
          content="Track and manage your plant care with AI-powered insights"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
        {/* Initialize theme from localStorage before rendering to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (theme === null && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-slate-950">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <>
      <NavigationProgressBar />
      <Navigation isAuthenticated={!!userId} />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <html lang="en">
      <head>
        <title>{message}</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl font-bold text-emerald-600 mb-4">{message}</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{details}</p>
            {stack && import.meta.env.DEV && (
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg text-left text-sm overflow-x-auto mb-8 border border-gray-700">
                <pre className="font-mono text-xs leading-relaxed">
                  <code>{stack}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
