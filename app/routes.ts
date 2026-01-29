import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // Home/Landing
  index('routes/home.tsx'),

  // Authentication Routes
  route('auth/login', 'routes/auth.login.tsx'),
  route('auth/register', 'routes/auth.register.tsx'),
  route('auth/logout', 'routes/auth.logout.tsx'),

  // API Routes
  route('api/notifications', 'routes/api.notifications.tsx'),
  route('api/rooms', 'routes/api.rooms.tsx'),
  route('api/water/:plantId', 'routes/api.water.$plantId.tsx'),

  // Dashboard Routes (Protected)
  route('dashboard', 'routes/dashboard.tsx', [
    index('routes/dashboard._index.tsx'),
    route('plants/new', 'routes/dashboard.plants.new.tsx'),
    route('plants/new-ai', 'routes/dashboard.plants.new-ai.tsx'),
    route('plants/:plantId', 'routes/dashboard.plants.$plantId.tsx'),
    route('plants/:plantId/edit', 'routes/dashboard.plants.$plantId.edit.tsx'),
  ]),
] satisfies RouteConfig;
