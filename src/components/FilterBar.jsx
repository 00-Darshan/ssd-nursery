import { usePlantStore } from "../store/plantStore";

const toFilterValue = (name) => name.toLocaleLowerCase();

export default function FilterBar({ activeCategory, onChange }) {
  const categories = usePlantStore((state) => state.categories);
  const filterCategories = [
    { label: "All", value: "all" },
    ...categories.map((category) => ({
      label: category.name,
      value: toFilterValue(category.name),
    })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Plant category filters">
      {filterCategories.map((category) => {
        const isActive = activeCategory === category.value;

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
              isActive
                ? "bg-leaf-600 text-white shadow-soft"
                : "border border-leaf-100 bg-white/80 text-stone-700 hover:border-leaf-300 hover:bg-leaf-50"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
