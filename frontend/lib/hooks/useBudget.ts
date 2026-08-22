import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, addExpense, deleteExpense } from "../api/budget";
import { Expense } from "../api/types";

export function useBudget(tripId: string) {
  return useQuery({
    queryKey: ["budget", tripId],
    queryFn: () => getExpenses(tripId),
    enabled: !!tripId,
  });
}

export function useAddExpense(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Expense>) => addExpense(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
    },
  });
}
