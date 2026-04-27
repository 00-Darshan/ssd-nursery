const categories = [
  { label: "All", value: "all" },
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Sun", value: "sun" },
  { label: "Shade", value: "shade" },
  { label: "Medicinal", value: "medicinal" },
  { label: "Ornamental", value: "ornamental" },
];

export default function FilterBar({ activeCategory, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Plant category filters">
      {categories.map((category) => {
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
