import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () => {
  const queryCache = new QueryCache({
    onError: (error) => {
      console.error("Ошибка запроса:", error);
    },
  });

  const mutationCache = new MutationCache({
    onError: (error) => {
      console.error("Ошибка мутации:", error);
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
}
