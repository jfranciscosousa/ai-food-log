import { type LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import acceptLanguage from "accept-language-parser";
import React, { useEffect } from "react";
import ErrorPage from "./components/Error500Page";
import { CLIENT_ENV } from "./env";
import { useRootLoaderData } from "./hooks/useRootLoaderData";
import { getCurrentTheme } from "./server/theme.server";
import { cn } from "./utils";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";

import "./root.css";

// Load the locale from the Accept-Language header to later
// inject it on the app's context
function localeFromRequest(request: Request): string {
  const languages = acceptLanguage.parse(
    request.headers.get("Accept-Language") as string,
  );

  // If somehow the header is empty, return a default locale
  if (languages?.length < 1) return "en-us";

  // If there is no region for this locale, just return the country code
  if (!languages[0].region) return languages[0].code;

  return `${languages[0].code}-${languages[0].region.toLowerCase()}`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    locale: localeFromRequest(request),
    ENV: CLIENT_ENV,
    rootTime: new Date().toISOString(),
    currentTheme: await getCurrentTheme(request),
  };
};

export const meta = () => [{ title: "AI Food Log" }];

function applySystemTheme() {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const cl = document.documentElement.classList;

  cl.add(theme);
}

const applySystemThemeString = `
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
  const cl = document.documentElement.classList;

  cl.add(theme);
`;

export default function App() {
  const { ENV, currentTheme } = useRootLoaderData();
  const { toast } = useToast();

  useEffect(() => {
    if (currentTheme === "system") applySystemTheme();
  }, [currentTheme, toast]);

  return (
    <Document className={currentTheme}>
      <script
        // Set the variables for our `envVars` modules
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)};

          // Only apply the system theme if there's nothing on the cookie
          ${currentTheme === "system" ? applySystemThemeString : ""}`,
        }}
      />

      <Outlet />
    </Document>
  );
}

/**
 * This will render errors without env vars or any locale
 * info unfortunately as errors can happen on the root loader.
 */
export function ErrorBoundary() {
  return (
    <Document>
      <ErrorPage />
    </Document>
  );
}

function Document({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <React.StrictMode>
      <html
        className={cn(className, "bg-background text-foreground")}
        lang="en"
      >
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
          <link rel="icon" href="/favicon.ico" sizes="48x48" />
          <link
            rel="icon"
            href="/favicon.svg"
            sizes="any"
            type="image/svg+xml"
          />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest-v1.webmanifest" />
          <Meta />
          <Links />
        </head>
        <body>
          <Toaster />
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </React.StrictMode>
  );
}
