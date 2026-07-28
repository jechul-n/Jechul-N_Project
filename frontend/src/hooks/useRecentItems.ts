import { useCallback, useState } from "react";

import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "../lib/storage";
import type {
  RecentItem,
  SaveKeywordInput,
  SavePlaceInput,
} from "../types/storage";

const MAX_RECENT_ITEMS = 50;

function sortByLatest(items: RecentItem[]): RecentItem[] {
  return [...items].sort(
    (firstItem, secondItem) =>
      Date.parse(secondItem.savedAt) - Date.parse(firstItem.savedAt)
  );
}

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLocaleLowerCase();
}

export function useRecentItems() {
  const [items, setItems] = useState<RecentItem[]>(() => {
    const storedItems = readStoredJson<unknown>(
      STORAGE_KEYS.recentItems,
      () => []
    );

    return Array.isArray(storedItems) ? sortByLatest(storedItems as RecentItem[]) : [];
  });

  const updateItems = useCallback(
    (createNextItems: (currentItems: RecentItem[]) => RecentItem[]) => {
      setItems((currentItems) => {
        const nextItems = sortByLatest(createNextItems(currentItems)).slice(
          0,
          MAX_RECENT_ITEMS
        );
        writeStoredJson(STORAGE_KEYS.recentItems, nextItems);
        return nextItems;
      });
    },
    []
  );

  const recordKeyword = useCallback(
    (input: SaveKeywordInput) => {
      const keyword = input.keyword.trim();

      if (!keyword) {
        return;
      }

      const id = `keyword:${normalizeKeyword(keyword)}`;
      const savedAt = new Date().toISOString();

      updateItems((currentItems) => [
        ...currentItems.filter((item) => item.id !== id),
        {
          id,
          type: "keyword",
          keyword,
          category: input.category,
          season: input.season,
          savedAt,
        },
      ]);
    },
    [updateItems]
  );

  const recordPlace = useCallback(
    (input: SavePlaceInput) => {
      const placeId = input.placeId.trim();

      if (!placeId) {
        return;
      }

      const id = `place:${placeId}`;
      const savedAt = new Date().toISOString();

      updateItems((currentItems) => [
        ...currentItems.filter((item) => item.id !== id),
        {
          id,
          type: "place",
          ...input,
          placeId,
          savedAt,
        },
      ]);
    },
    [updateItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    },
    [updateItems]
  );

  const clearItems = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  return {
    items,
    recordKeyword,
    recordPlace,
    removeItem,
    clearItems,
    maxItems: MAX_RECENT_ITEMS,
  };
}
