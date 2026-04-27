import { CloudSun, Plus, Sun } from "lucide-react";

const placementStyles = {
  sun: {
    label: "Sun",
    className: "bg-amber-100 text-amber-800",
    Icon: Sun,
  },
  shade: {
    label: "Shade",
    className: "bg-emerald-100 text-emerald-800",
    Icon: CloudSun,
  },
  both: {
    label: "Sun & Shade",
    className: "bg-teal-100 text-teal-800",
    Icon: CloudSun,
  },
};

export default function PlantCard({ plant, isImageLoading = false, onAdd, onOpen }) {
  const placement = placementStyles[plant.placement] ?? placementStyles.shade;
  const PlacementIcon = placement.Icon;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(plant);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(plant)}
      onKeyDown={handleKeyDown}
      className="group overflow-hidden rounded-3xl border border-white bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-soft"
      aria-label={`View details for ${plant.name}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-100">
        {isImageLoading ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-leaf-50 via-leaf-100 to-emerald-50" />
        ) : (
          <img
            src={plant.image}
            alt={plant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            crossOrigin="anonymous"
          />
        )}
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${placement.className}`}
        >
          <PlacementIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {placement.label}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-extrabold text-leaf-900">{plant.name}</h2>
          <p className="mt-1 text-base font-bold text-loam">{plant.kannada_name}</p>
          <p className="mt-1 text-sm italic text-stone-500">{plant.scientific_name}</p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(plant, 1);
          }}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-4 text-sm font-extrabold text-white transition hover:bg-leaf-700"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
