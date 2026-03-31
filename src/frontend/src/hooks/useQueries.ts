import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlayerInput } from "../backend.d";
import { useActor } from "./useActor";

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPlayerData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlayerInput) => {
      if (!actor) throw new Error("No actor");
      return actor.setPlayerData(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
