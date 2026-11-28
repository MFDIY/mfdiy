import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('connect', 'routes/connect.tsx'),
  route(':id', 'routes/profile.tsx')
] satisfies RouteConfig;
