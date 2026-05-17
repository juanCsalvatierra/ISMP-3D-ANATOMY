import { AnatomyItem, useAnatomyStore } from "../../store/anatomyStore";
import { normalize } from "../../utils/normalize";

type Props = {
  json: Record<string, AnatomyItem>;
};

export function Search({ json }: Props) {
  const setSelected = useAnatomyStore((s) => s.setSelected);

  function handleSearch(value: string) {
    const n = normalize(value);

    const found = Object.values(json).find((item) => {
      const names = Array.isArray(item.english_name)
        ? item.english_name.join(" ")
        : item.english_name;

      return normalize(names).includes(n);
    });

    if (found) setSelected(found);
  }

  return (
    <input
      id="search"
      className="ui-input mt-4 mb-3"
      placeholder="Buscar estructura..."
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}