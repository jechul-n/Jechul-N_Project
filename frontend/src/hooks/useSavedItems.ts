import { useCallback, useState } from "react";

import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "../lib/storage";
import type {
  SavedItem,
  SaveKeywordInput,
  SavePlaceInput,
} from "../types/storage";

function sortByLatest(items: SavedItem[]): SavedItem[] {
  return [...items].sort(
    (firstItem, secondItem) =>
      Date.parse(secondItem.savedAt) - Date.parse(firstItem.savedAt)
  );
}

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLocaleLowerCase();
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>(() => {
    const storedItems = readStoredJson<unknown>(
      STORAGE_KEYS.savedItems,
      () => []
    );

    return Array.isArray(storedItems) ? sortByLatest(storedItems as SavedItem[]) : [];
  });

  const updateItems = useCallback(
    (createNextItems: (currentItems: SavedItem[]) => SavedItem[]) => {
      setItems((currentItems) => {
        const nextItems = sortByLatest(createNextItems(currentItems));
        writeStoredJson(STORAGE_KEYS.savedItems, nextItems);
        return nextItems;
      });
    },
    []
  );

  const saveKeyword = useCallback(
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

  const savePlace = useCallback(
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
    saveKeyword,
    savePlace,
    removeItem,
    clearItems,
    hasKeyword: (keyword: string) =>
      items.some(
        (item) =>
          item.type === "keyword" &&
          normalizeKeyword(item.keyword) === normalizeKeyword(keyword)
      ),
    hasPlace: (placeId: string) =>
      items.some(
        (item) => item.type === "place" && item.placeId === placeId
      ),
  };
}
