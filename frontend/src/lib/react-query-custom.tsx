"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export class QueryClient {
  private listeners: Set<() => void> = new Set();
  private cache: Map<string, any> = new Map();
  private promises: Map<string, Promise<any>> = new Map();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  setQueryData(queryKey: any[], data: any) {
    const key = JSON.stringify(queryKey);
    this.cache.set(key, data);
    this.notify();
  }

  getQueryData(queryKey: any[]) {
    const key = JSON.stringify(queryKey);
    return this.cache.get(key);
  }

  invalidateQueries({ queryKey }: { queryKey: any[] }) {
    const keyPrefix = JSON.stringify(queryKey);
    
    // Find all matching keys in cache and delete them, so hooks refetch
    for (const cacheKey of Array.from(this.cache.keys())) {
      if (cacheKey.startsWith(keyPrefix.substring(0, keyPrefix.length - 1))) {
        this.cache.delete(cacheKey);
        this.promises.delete(cacheKey);
      }
    }
    this.notify();
  }

  cancelQueries({ queryKey }: { queryKey: any[] }) {
    // Polyfill no-op for cancellation
    return Promise.resolve();
  }

  async fetchQuery(queryKey: any[], queryFn: () => Promise<any>) {
    const key = JSON.stringify(queryKey);
    if (this.promises.has(key)) {
      return this.promises.get(key);
    }
    const promise = queryFn()
      .then((data) => {
        this.cache.set(key, data);
        this.promises.delete(key);
        return data;
      })
      .catch((err) => {
        this.promises.delete(key);
        throw err;
      });
    this.promises.set(key, promise);
    return promise;
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

export function QueryClientProvider({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient() {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }
  return context;
}

export function useQuery<TData = any>({
  queryKey,
  queryFn,
  enabled = true,
}: {
  queryKey: any[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
}) {
  const client = useQueryClient();
  const keyString = JSON.stringify(queryKey);
  
  const [state, setState] = useState(() => {
    const cached = client.getQueryData(queryKey);
    return {
      data: cached as TData | undefined,
      isLoading: cached === undefined && enabled,
      isError: false,
      error: null as any,
    };
  });

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const runQuery = useCallback(async (force = false) => {
    if (!enabled && !force) return;

    const cached = client.getQueryData(queryKey);
    if (cached !== undefined && !force) {
      setState((prev) => ({
        ...prev,
        data: cached,
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: cached === undefined,
    }));

    try {
      const data = await client.fetchQuery(queryKey, () => queryFnRef.current());
      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: undefined,
        isLoading: false,
        isError: true,
        error,
      });
    }
  }, [client, keyString, enabled]);

  useEffect(() => {
    runQuery();
  }, [runQuery]);

  useEffect(() => {
    const unsubscribe = client.subscribe(() => {
      const currentCache = client.getQueryData(queryKey);
      if (currentCache === undefined) {
        runQuery(true);
      } else {
        setState((prev) => ({
          ...prev,
          data: currentCache,
        }));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [client, keyString, runQuery]);

  return {
    ...state,
    refetch: () => runQuery(true),
  };
}

export function useMutation<TVariables = any, TData = any>({
  mutationFn,
  onSuccess,
  onError,
  onMutate,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<unknown>;
  onError?: (error: Error, variables: TVariables) => void | Promise<unknown>;
  onMutate?: (variables: TVariables) => Promise<unknown> | void;
}) {
  const [state, setState] = useState({
    isPending: false,
    error: null as Error | null,
    data: undefined as TData | undefined,
    variables: undefined as TVariables | undefined,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({ isPending: true, error: null, data: undefined, variables });
      if (onMutate) {
        try {
          await onMutate(variables);
        } catch (err) {
          console.error("onMutate callback failed:", err);
        }
      }
      try {
        const data = await mutationFn(variables);
        setState({ isPending: false, error: null, data, variables });
        if (onSuccess) {
          await onSuccess(data, variables);
        }
        return data;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(err?.message || "Mutation failed");
        setState({ isPending: false, error, data: undefined, variables });
        if (onError) {
          await onError(error, variables);
        }
      }
    },
    [mutationFn, onSuccess, onError, onMutate]
  );

  return {
    mutate,
    mutateAsync: mutate,
    isPending: state.isPending,
    error: state.error,
    data: state.data,
    variables: state.variables,
  };
}
