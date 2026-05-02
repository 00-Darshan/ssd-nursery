import { create } from "zustand";
import { DEFAULT_PLANT_IMAGE, fetchPlantImage } from "../utils/fetchPlantImage";

const hasRemoteImage = (image) => /^https?:\/\//i.test(image || "");

export const resolvePlantImage = (plant, imageCache = {}) => {
  const sourceImage = plant.image_url || plant.image;

  if (hasRemoteImage(sourceImage)) {
    return sourceImage;
  }

  return imageCache[plant.id] || DEFAULT_PLANT_IMAGE;
};

export const usePlantImageStore = create((set, get) => ({
  imageCache: {},
  loadingIds: {},
  fetchImagesForPlants: async (plants) => {
    const { imageCache, loadingIds } = get();
    const plantsToFetch = plants.filter(
      (plant) =>
        !hasRemoteImage(plant.image) &&
        !hasRemoteImage(plant.image_url) &&
        !imageCache[plant.id] &&
        !loadingIds[plant.id],
    );

    if (!plantsToFetch.length) return;

    set((state) => ({
      loadingIds: {
        ...state.loadingIds,
        ...Object.fromEntries(plantsToFetch.map((plant) => [plant.id, true])),
      },
    }));

    const results = await Promise.all(
      plantsToFetch.map(async (plant) => [plant.id, await fetchPlantImage(plant.name)]),
    );

    set((state) => {
      const nextLoadingIds = { ...state.loadingIds };
      results.forEach(([plantId]) => {
        delete nextLoadingIds[plantId];
      });

      return {
        imageCache: {
          ...state.imageCache,
          ...Object.fromEntries(results),
        },
        loadingIds: nextLoadingIds,
      };
    });
  },
  setCachedImage: (plantId, imageUrl) =>
    set((state) => ({
      imageCache: {
        ...state.imageCache,
        [plantId]: imageUrl || DEFAULT_PLANT_IMAGE,
      },
    })),
}));
