"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/queryClient";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensure we don't share query clients between users on the server
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
