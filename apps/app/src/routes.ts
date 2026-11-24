import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('display', 'routes/display.tsx'),
  route('builder', 'routes/builder.tsx')
] satisfies RouteConfig;
