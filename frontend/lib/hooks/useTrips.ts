import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, addStop, reorderStops, deleteStop, GetTripsParams } from "../api/trips";
import { Trip, Stop } from "../api/types";

export function useTrips(params?: GetTripsParams) {
  return useQuery({
    queryKey: ["trips", params],
    queryFn: () => getTrips(params),
  });
}

export function useInfiniteTrips(params?: Omit<GetTripsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: ["trips", "infinite", params],
    queryFn: ({ pageParam = 0 }) => getTrips({ ...params, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => getTrip(tripId),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrip,
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData(["trips", updatedTrip.id], updatedTrip);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onMutate: async (deletedId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      
      const previousTrips = queryClient.getQueryData(["trips"]);
      
      // We don't perfectly mock infinite query invalidation here since it's complex,
      // but we force a refetch on success. We can just rely on the UI hiding it first.
      return { previousTrips };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    }
  });
}

// Example with optimistic update for reordering stops
export function useReorderStops(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: { id: string; sortOrder: number }[]) => reorderStops(tripId, orderData),
    onMutate: async (newOrderData) => {
      await queryClient.cancelQueries({ queryKey: ["trips", tripId] });

      const previousTrip = queryClient.getQueryData<Trip>(["trips", tripId]);

      if (previousTrip && previousTrip.stops) {
        // Optimistically update the order in cache
        const updatedStops = [...previousTrip.stops];
        newOrderData.forEach(({ id, sortOrder }) => {
          const stop = updatedStops.find(s => s.id === id);
          if (stop) stop.sortOrder = sortOrder;
        });
        // Re-sort array
        updatedStops.sort((a, b) => a.sortOrder - b.sortOrder);

        queryClient.setQueryData<Trip>(["trips", tripId], {
          ...previousTrip,
          stops: updatedStops,
        });
      }

      return { previousTrip };
    },
    onError: (err, variables, context) => {
      if (context?.previousTrip) {
        queryClient.setQueryData(["trips", tripId], context.previousTrip);
      }
      // TODO: Show visible error toast here as per requirements
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", tripId] });
    },
  });
}
