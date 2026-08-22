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
      await queryClient.cancelQueries({ queryKey: ["trips"] });
      const previousTrips = queryClient.getQueryData(["trips"]);
      return { previousTrips };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    }
  });
}

export function useAddStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Stop>) => addStop(tripId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useUpdateStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string, data: Partial<Stop> }) => updateStop(tripId, stopId, data),
    onMutate: async ({ stopId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["trips", tripId] });
      const prevTrip = queryClient.getQueryData<Trip>(["trips", tripId]);
      
      if (prevTrip?.stops) {
        queryClient.setQueryData<Trip>(["trips", tripId], {
          ...prevTrip,
          stops: prevTrip.stops.map(s => s.id === stopId ? { ...s, ...data } : s)
        });
      }
      return { prevTrip };
    },
    onError: (err, variables, context) => {
      if (context?.prevTrip) queryClient.setQueryData(["trips", tripId], context.prevTrip);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useDeleteStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => deleteStop(tripId, stopId),
    onMutate: async (stopId) => {
      await queryClient.cancelQueries({ queryKey: ["trips", tripId] });
      const prevTrip = queryClient.getQueryData<Trip>(["trips", tripId]);
      
      if (prevTrip?.stops) {
        queryClient.setQueryData<Trip>(["trips", tripId], {
          ...prevTrip,
          stops: prevTrip.stops.filter(s => s.id !== stopId)
        });
      }
      return { prevTrip };
    },
    onError: (err, variables, context) => {
      if (context?.prevTrip) queryClient.setQueryData(["trips", tripId], context.prevTrip);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useReorderStops(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: { id: string; order_index: number }[]) => reorderStops(tripId, orderData),
    onMutate: async (newOrderData) => {
      await queryClient.cancelQueries({ queryKey: ["trips", tripId] });
      const prevTrip = queryClient.getQueryData<Trip>(["trips", tripId]);

      if (prevTrip?.stops) {
        const updatedStops = [...prevTrip.stops];
        newOrderData.forEach(({ id, order_index }) => {
          const stop = updatedStops.find(s => s.id === id);
          if (stop) stop.orderIndex = order_index;
        });
        updatedStops.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

        queryClient.setQueryData<Trip>(["trips", tripId], {
          ...prevTrip,
          stops: updatedStops,
        });
      }
      return { prevTrip };
    },
    onError: (err, variables, context) => {
      if (context?.prevTrip) queryClient.setQueryData(["trips", tripId], context.prevTrip);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useAddActivity(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string, data: any }) => attachActivity(tripId, stopId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useRemoveActivity(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, activityId }: { stopId: string, activityId: string }) => removeActivity(tripId, stopId, activityId),
    onMutate: async ({ stopId, activityId }) => {
      await queryClient.cancelQueries({ queryKey: ["trips", tripId] });
      const prevTrip = queryClient.getQueryData<Trip>(["trips", tripId]);
      
      if (prevTrip?.stops) {
        queryClient.setQueryData<Trip>(["trips", tripId], {
          ...prevTrip,
          stops: prevTrip.stops.map(s => {
            if (s.id === stopId && s.activities) {
              return { ...s, activities: s.activities.filter(a => a.id !== activityId && a.stop_activity_id !== activityId) };
            }
            return s;
          })
        });
      }
      return { prevTrip };
    },
    onError: (err, variables, context) => {
      if (context?.prevTrip) queryClient.setQueryData(["trips", tripId], context.prevTrip);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}
