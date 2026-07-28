import { useCallback, useState } from "react";

import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "../lib/storage";

const MAX_RECENT_SEARCHES = 10;

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLocaleLowerCase();
}

function getRecentSearches(): string[] {
  const storedKeywords = readStoredJson<unknown>(
    STORAGE_KEYS.recentSearches,
    () => []
  );

  if (!Array.isArray(storedKeywords)) {
    return [];
  }

  return storedKeywords.filter(
    (keyword): keyword is string => typeof keyword === "string" && Boolean(keyword.trim())
  );
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);

  const updateRecentSearches = useCallback(
    (createNextKeywords: (currentKeywords: string[]) => string[]) => {
      setRecentSearches((currentKeywords) => {
        const nextKeywords = createNextKeywords(currentKeywords).slice(
          0,
          MAX_RECENT_SEARCHES
        );
        writeStoredJson(STORAGE_KEYS.recentSearches, nextKeywords);
        return nextKeywords;
      });
    },
    []
  );

  const addSearch = useCallback(
    (keyword: string) => {
      const trimmedKeyword = keyword.trim();

      if (!trimmedKeyword) {
        return;
      }

      updateRecentSearches((currentKeywords) => [
        trimmedKeyword,
        ...currentKeywords.filter(
          (currentKeyword) =>
            normalizeKeyword(currentKeyword) !== normalizeKeyword(trimmedKeyword)
        ),
      ]);
    },
    [updateRecentSearches]
  );

  const removeSearch = useCallback(
    (keyword: string) => {
      updateRecentSearches((currentKeywords) =>
        currentKeywords.filter(
          (currentKeyword) => normalizeKeyword(currentKeyword) !== normalizeKeyword(keyword)
        )
      );
    },
    [updateRecentSearches]
  );

  const clearSearches = useCallback(() => {
    updateRecentSearches(() => []);
  }, [updateRecentSearches]);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
    maxSearches: MAX_RECENT_SEARCHES,
  };
}
