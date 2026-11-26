import type { PropsWithChildren } from 'react';

import '@mfdiy/ui';
import martianMono from '@mfdiy/ui/fonts/MartianMono.woff2?url';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { DocumentsProvider } from './documents/DocumentsProvider.js';
import { TelemetryProvider } from './telemetry/TelemetryProvider.js';

const favicon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="5" fill="#0b0f0c" stroke="#59ff9c" stroke-width="2"/><rect x="8" y="8" width="16" height="16" rx="2" fill="none" stroke="#59ff9c" stroke-width="2"/></svg>'
)}`;

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta content='width=device-width, initial-scale=1, viewport-fit=cover' name='viewport' />
        <meta content='#0b0b0a' name='theme-color' />
        <link href={favicon} rel='icon' />
        <title>MFDIY</title>
        {/* Declared in @mfdiy/ui; preloaded so the interface doesn't flash in a fallback font. */}
        <link as='font' crossOrigin='' href={martianMono} rel='preload' type='font/woff2' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <TelemetryProvider>
      <DocumentsProvider>
        <Outlet />
      </DocumentsProvider>
    </TelemetryProvider>
  );
}

export function HydrateFallback() {
  return null;
}
