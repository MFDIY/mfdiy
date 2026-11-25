import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('display/:id', 'routes/display.tsx'),
  route('builder/:id', 'routes/builder.tsx')
] satisfies RouteConfig;
