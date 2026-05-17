import { buildJsonIndex } from "./indexBuilder";

export function findBestJsonMatch(
  meshName: string,
  index: ReturnType<typeof buildJsonIndex>
) {
  const { exactMap, fuzzyList } = index;

  if (exactMap[meshName]) {
    return exactMap[meshName];
  }

  let bestKey: string | null = null;
  let bestScore = 0;

  for (const { key, name } of fuzzyList) {
    if (meshName.includes(name) || name.includes(meshName)) {
      const score =
        Math.min(meshName.length, name.length) /
        Math.max(meshName.length, name.length);

      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }
  }

  return bestScore > 0.6 ? bestKey : null;
}