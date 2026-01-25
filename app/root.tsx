import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { Navigation } from "~/components/nav";
import { getUserId } from "~/lib/session.server";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
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
        <meta name="description" content="Track and manage your plant care with AI-powered insights" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white">
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
      <Navigation isAuthenticated={!!userId} />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
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
      <body>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4">{message}</h1>
            <p className="text-lg text-gray-600 mb-8">{details}</p>
            {stack && import.meta.env.DEV && (
              <pre className="w-full max-w-2xl bg-gray-100 p-4 rounded text-left text-xs overflow-x-auto mb-8">
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
