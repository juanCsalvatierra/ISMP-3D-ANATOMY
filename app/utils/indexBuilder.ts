import { normalize } from "./normalize";

type FuzzyEntry = {
  key: string;
  name: string;
};

export type JsonIndex = {
  exactMap: Record<string, string>;
  fuzzyList: FuzzyEntry[];
};

type IndexableAnatomyItem = {
  english_name: string | string[];
};

export function buildJsonIndex(json: Record<string, IndexableAnatomyItem>): JsonIndex {
  const exactMap: Record<string, string> = {};
  const fuzzyList: FuzzyEntry[] = [];

  for (const [key, item] of Object.entries(json)) {
    const names = Array.isArray(item.english_name)
      ? item.english_name
      : [item.english_name];

    for (const rawName of names) {
      const normalized = normalize(rawName);

      exactMap[normalized] = key;

      fuzzyList.push({ key, name: normalized });
    }
  }

  return { exactMap, fuzzyList };
}