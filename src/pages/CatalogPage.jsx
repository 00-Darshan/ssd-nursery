import { useEffect, useMemo, useState } from "react";
import { Leaf, LoaderCircle, RefreshCw, Sprout } from "lucide-react";
import CartDrawer from "../components/CartDrawer";
import FilterBar from "../components/FilterBar";
import PlantCard from "../components/PlantCard";
import PlantModal from "../components/PlantModal";
import SearchBar from "../components/SearchBar";
import Toast from "../components/Toast";
import { useCartStore } from "../store/cartStore";
import { resolvePlantImage, usePlantImageStore } from "../store/plantImageStore";
import { usePlantStore } from "../store/plantStore";

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const addPlant = useCartStore((state) => state.addPlant);
  const plants = usePlantStore((state) => state.plants);
  const isLoading = usePlantStore((state) => state.isLoading);
  const error = usePlantStore((state) => state.error);
  const initialize = usePlantStore((state) => state.initialize);
  const imageCache = usePlantImageStore((state) => state.imageCache);
  const loadingIds = usePlantImageStore((state) => state.loadingIds);
  const fetchImagesForPlants = usePlantImageStore((state) => state.fetchImagesForPlants);

  useEffect(() => {
    if (plants.length) {
      fetchImagesForPlants(plants);
    }
  }, [fetchImagesForPlants, plants]);

  const catalogPlants = useMemo(
    () =>
      plants.map((plant) => ({
        ...plant,
        image: resolvePlantImage(plant, imageCache),
      })),
    [imageCache, plants],
  );

  const filteredPlants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    return catalogPlants.filter((plant) => {
      const matchesCategory =
        activeCategory === "all" ||
        (plant.category || []).some(
          (category) =>
            category.toLocaleLowerCase() === activeCategory.toLocaleLowerCase(),
        );

      const searchableText = [plant.name, plant.kannada_name, plant.scientific_name]
        .join(" ")
        .toLocaleLowerCase();

      return matchesCategory && searchableText.includes(normalizedSearch);
    });
  }, [activeCategory, catalogPlants, searchTerm]);

  const selectedPlant = useMemo(
    () => catalogPlants.find((plant) => plant.id === selectedPlantId) || null,
    [catalogPlants, selectedPlantId],
  );

  const handleAddToCart = (plant, quantity = 1) => {
    addPlant(plant, quantity);
    setToast(`${plant.name} added to cart \u2713`);
    window.clearTimeout(window.greenpickToastTimer);
    window.greenpickToastTimer = window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="border-b border-white/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-white px-3 py-1 text-sm font-extrabold text-leaf-700 shadow-card">
                <Sprout aria-hidden="true" className="h-4 w-4" />
                Plant procurement made lighter
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-600 text-white shadow-soft">
                  <Leaf aria-hidden="true" className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-normal text-leaf-900 sm:text-5xl">
                    Sri Sai Darshan Nursery
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-stone-600 sm:text-base">
                    Select indoor, outdoor, medicinal, and ornamental plants for landscaping
                    projects and customer orders.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-leaf-100 bg-white p-4 shadow-card md:min-w-[16rem]">
              <p className="text-sm font-bold text-stone-500">Catalog size</p>
              <p className="mt-1 text-3xl font-extrabold text-leaf-900">{plants.length} plants</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <FilterBar activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-leaf-100 bg-white/80 p-8 text-center shadow-card">
            <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-leaf-600" />
            <p className="mt-4 text-lg font-extrabold text-leaf-900">Loading plants...</p>
          </section>
        ) : error ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-red-100 bg-white/80 p-8 text-center shadow-card">
            <h2 className="text-2xl font-extrabold text-leaf-900">
              Could not load plants. Please try again.
            </h2>
            <button
              type="button"
              onClick={initialize}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white transition hover:bg-leaf-700"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Retry
            </button>
          </section>
        ) : filteredPlants.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isImageLoading={Boolean(loadingIds[plant.id])}
                onAdd={handleAddToCart}
                onOpen={(nextPlant) => setSelectedPlantId(nextPlant.id)}
              />
            ))}
          </div>
        ) : (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-leaf-100 bg-white/80 p-8 text-center shadow-card">
            <Sprout aria-hidden="true" className="h-12 w-12 text-leaf-600" />
            <h2 className="mt-4 text-2xl font-extrabold text-leaf-900">No plants found</h2>
          </section>
        )}
      </main>

      <PlantModal
        plant={selectedPlant}
        onClose={() => setSelectedPlantId(null)}
        onAdd={handleAddToCart}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
      />
      <Toast message={toast} />
    </div>
  );
}
