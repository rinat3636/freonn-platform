import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

function hideSplash() {
  const splash = document.getElementById("app-splash");
  if (!splash) return;
  splash.classList.add("hidden");
  window.setTimeout(() => splash.remove(), 400);
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App onReady={hideSplash} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </trpc.Provider>
);

window.setTimeout(hideSplash, 100);

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("Service worker setup failed", e);
  }
}

setupServiceWorker();
