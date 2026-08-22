import { apiClient } from "./client";
import { Expense } from "./types";

// TODO: Verify budget/expenses endpoint path
export function getExpenses(tripId: string): Promise<Expense[]> {
  return apiClient(`/trips/${tripId}/budget`);
}

export function addExpense(tripId: string, data: Partial<Expense>): Promise<Expense> {
  return apiClient(`/trips/${tripId}/budget`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  return apiClient(`/trips/${tripId}/budget/${expenseId}`, {
    method: "DELETE",
  });
}
