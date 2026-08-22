import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reference/static data fetched with a long staleTime
      staleTime: 5 * 60 * 1000, 
      retry: 1,
    },
  },
});
