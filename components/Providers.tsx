"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, trpcClient } from "@/lib/libTrpc";
import { trpc } from "@/server/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
