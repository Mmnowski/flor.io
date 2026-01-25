import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home/Landing
  index("routes/home.tsx"),

  // Authentication Routes
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/register", "routes/auth.register.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),

  // Dashboard Routes (Protected)
  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard._index.tsx"),
    route("plants/new", "routes/dashboard.plants.new.tsx"),
    route("plants/:plantId", "routes/dashboard.plants.$plantId.tsx"),
    route("plants/:plantId/edit", "routes/dashboard.plants.$plantId.edit.tsx"),
  ]),
] satisfies RouteConfig;
