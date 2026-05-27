import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campayn - Creator App" },
      { name: "description", content: "India's AI-powered creator marketing app." },
      { name: "author", content: "Campayn" },
      { property: "og:title", content: "Campayn - Creator App" },
      { property: "og:description", content: "India's AI-powered creator marketing app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@campayn" },
      { name: "twitter:title", content: "Campayn - Creator App" },
      { name: "twitter:description", content: "India's AI-powered creator marketing app." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/780d872c-3928-4d5d-baf0-117c1d9f9108/id-preview-ae9b2095--c2777a74-caab-4e3d-b72b-0a0dac61e97c.lovable.app-1778844559966.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/780d872c-3928-4d5d-baf0-117c1d9f9108/id-preview-ae9b2095--c2777a74-caab-4e3d-b72b-0a0dac61e97c.lovable.app-1778844559966.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    // Intercept Instagram connection callback redirect parameters
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const handle = params.get("handle");
    const message = params.get("message");

    if (status) {
      if (status === "success") {
        toast.success(`Instagram account @${handle} connected successfully! 🎉`);
        
        // Check if there was a pending onboarding flow
        const onboardingPending = localStorage.getItem("campayn_onboarding_pending");
        if (onboardingPending === "true") {
          // Clear pending flag so we don't loop
          localStorage.removeItem("campayn_onboarding_pending");
          // Let onboarding know it was successful
          localStorage.setItem("campayn_onboarding_success", "true");
          // Force navigate to onboarding so they can finish
          window.location.href = "/onboarding";
          return;
        } else {
          // If not in onboarding, redirect to the connected accounts page!
          window.location.href = "/app/connected";
          return;
        }
      } else if (status === "error") {
        toast.error(message || "Failed to connect Instagram account.");
        
        const onboardingPending = localStorage.getItem("campayn_onboarding_pending");
        if (onboardingPending === "true") {
          localStorage.removeItem("campayn_onboarding_pending");
          window.location.href = "/onboarding";
          return;
        }
      }
      
      // Clean query parameters from URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  return (
    <>
      <Outlet />
      <Toaster theme="light" position="top-center" richColors />
    </>
  );
}
