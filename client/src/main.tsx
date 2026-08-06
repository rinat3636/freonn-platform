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

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </trpc.Provider>
);

async function clearStaleServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length > 0) {
      // Remove the old SW and wipe its caches so the next load uses the fresh shell.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((name) => caches.delete(name)));
      } catch {
        /* ignore cache cleanup errors */
      }
      await Promise.all(regs.map((reg) => reg.unregister()));
      window.location.href = "/";
      return;
    }
    await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("Service worker setup failed", e);
  }
}

clearStaleServiceWorker();
