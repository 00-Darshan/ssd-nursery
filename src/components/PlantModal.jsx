import { useEffect, useState } from "react";
import { CloudSun, Minus, Plus, Sun, X } from "lucide-react";

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

export default function PlantModal({ plant, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [plant?.id]);

  useEffect(() => {
    if (!plant) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, plant]);

  if (!plant) return null;

  const placement = placementStyles[plant.placement] ?? placementStyles.shade;
  const PlacementIcon = placement.Icon;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-loam/55 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-soft animate-slide-up"
      >
        <div className="grid max-h-[92vh] overflow-y-auto md:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-72 bg-leaf-100">
            <img
              src={plant.image}
              alt={plant.name}
              className="h-full min-h-72 w-full object-cover"
              crossOrigin="anonymous"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close plant details"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-loam shadow-card transition hover:bg-leaf-50"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold capitalize ${placement.className}`}
              >
                <PlacementIcon aria-hidden="true" className="h-4 w-4" />
                {placement.label}
              </span>
              <div>
                <h2 id="plant-modal-title" className="text-3xl font-extrabold text-leaf-900">
                  {plant.name}
                </h2>
                <p className="mt-2 text-xl font-bold text-loam">{plant.kannada_name}</p>
                <p className="mt-1 text-sm italic text-stone-500">{plant.scientific_name}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Origin</p>
                <p className="mt-1 font-bold text-loam">{plant.origin}</p>
              </div>
              <div className="rounded-2xl bg-leaf-50 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Placement</p>
                <p className="mt-1 font-bold capitalize text-loam">{plant.placement}</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Benefits
              </p>
              <div className="flex flex-wrap gap-2">
                {plant.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-leaf-100 bg-white px-3 py-1 text-sm font-bold text-leaf-900"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base leading-8 text-stone-700">{plant.description}</p>

            <div className="flex flex-col gap-4 border-t border-leaf-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex h-12 w-max items-center rounded-2xl border border-leaf-100 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  aria-label="Decrease quantity"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-l-2xl text-loam transition hover:bg-leaf-50"
                >
                  <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="min-w-[3rem] px-3 text-center text-lg font-extrabold text-leaf-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Increase quantity"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-r-2xl text-loam transition hover:bg-leaf-50"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAdd(plant, quantity);
                  onClose();
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-6 text-sm font-extrabold text-white shadow-soft transition hover:bg-leaf-700"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
