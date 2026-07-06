import { create } from "zustand";
import { getTests } from "../api/tests";
import type { TestRecord } from "../types/models";

interface TestsState {
  tests: TestRecord[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  fetchTests: (options?: { force?: boolean }) => Promise<void>;
  invalidate: () => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useTestsStore = create<TestsState>((set, get) => ({
  tests: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchTests: async ({ force = false } = {}) => {
    const { lastFetchedAt, isLoading } = get();
    const isFresh =
      lastFetchedAt !== null && Date.now() - lastFetchedAt < CACHE_TTL_MS;

    if (isLoading) return;
    if (isFresh && !force) return;

    set({ isLoading: true, error: null });
    try {
      const tests = await getTests();
      set({ tests, isLoading: false, lastFetchedAt: Date.now() });
    } catch {
      set({
        isLoading: false,
        error: "Failed to load tests. Please try again.",
      });
    }
  },
  invalidate: () => set({ lastFetchedAt: null }),
}));