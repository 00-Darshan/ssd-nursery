import { create } from "zustand";
import {
  addCategory as addCategoryRecord,
  addPlant as addPlantRecord,
  deleteCategory as deleteCategoryRecord,
  deletePlant as deletePlantRecord,
  getAllCategories,
  getAllPlants,
  updatePlant as updatePlantRecord,
} from "../utils/plantService";
import { PLANTS_STORAGE_KEY, toCategoryName } from "../utils/plantStore";

const sameCategory = (left, right) =>
  String(left || "").trim().toLocaleLowerCase() ===
  String(right || "").trim().toLocaleLowerCase();

const readLocalStoragePlants = () => {
  if (typeof window === "undefined") return [];

  const savedPlants = window.localStorage.getItem(PLANTS_STORAGE_KEY);
  if (!savedPlants) return [];

  try {
    const parsedPlants = JSON.parse(savedPlants);
    return Array.isArray(parsedPlants) ? parsedPlants : [];
  } catch {
    return [];
  }
};

const normalizeMigratedPlant = (plant) => ({
  ...plant,
  categories: (plant.categories || plant.category || []).map(toCategoryName).filter(Boolean),
  category: (plant.categories || plant.category || []).map(toCategoryName).filter(Boolean),
  image_url: plant.image_url || plant.image || "",
  image: plant.image_url || plant.image || "",
});

export const usePlantStore = create((set, get) => ({
  plants: [],
  categories: [],
  isLoading: false,
  isSaving: false,
  error: "",
  hasLoaded: false,
  hasMigrated: false,
  toast: "",

  showToast: (message) => {
    set({ toast: message });

    if (typeof window === "undefined") return;

    window.clearTimeout(window.greenPickAdminToastTimer);
    window.greenPickAdminToastTimer = window.setTimeout(() => {
      set({ toast: "" });
    }, 2400);
  },

  clearToast: () => set({ toast: "" }),

  migrateLocalPlants: async () => {
    if (get().hasMigrated) return;

    const savedPlants = readLocalStoragePlants();
    if (!savedPlants.length) {
      set({ hasMigrated: true });
      return;
    }

    await Promise.all(
      savedPlants.map((plant) => addPlantRecord(normalizeMigratedPlant(plant))),
    );

    window.localStorage.removeItem(PLANTS_STORAGE_KEY);
    console.log("Migration complete");
    set({ hasMigrated: true });
  },

  initialize: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: "" });

    try {
      await get().migrateLocalPlants();
      const [plants, categories] = await Promise.all([getAllPlants(), getAllCategories()]);
      set({ plants, categories, isLoading: false, hasLoaded: true, error: "" });
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error.message || "Could not load plants. Please try again.",
      });
    }
  },

  refreshPlants: async () => {
    const plants = await getAllPlants();
    set({ plants });
  },

  refreshCategories: async () => {
    const categories = await getAllCategories();
    set({ categories });
  },

  refreshAll: async () => {
    const [plants, categories] = await Promise.all([getAllPlants(), getAllCategories()]);
    set({ plants, categories, error: "", hasLoaded: true });
  },

  createPlant: async (plantData) => {
    set({ isSaving: true });

    try {
      await addPlantRecord(plantData);
      await get().refreshPlants();
      get().showToast("Plant added successfully \u2713");
    } catch (error) {
      get().showToast("Failed to save. Please try again.");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updatePlant: async (id, plantData) => {
    set({ isSaving: true });

    try {
      await updatePlantRecord(id, plantData);
      await get().refreshPlants();
      get().showToast("Plant updated successfully \u2713");
    } catch (error) {
      get().showToast("Failed to save. Please try again.");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  removePlant: async (id) => {
    set({ isSaving: true });

    try {
      await deletePlantRecord(id);
      await get().refreshPlants();
      get().showToast("Plant deleted \u2713");
    } catch (error) {
      get().showToast("Failed to save. Please try again.");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  createCategory: async (name) => {
    const categoryName = toCategoryName(name);

    set({ isSaving: true });

    try {
      await addCategoryRecord(categoryName);
      await get().refreshCategories();
      get().showToast("Category added \u2713");
    } catch (error) {
      get().showToast("Failed to save. Please try again.");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  removeCategory: async (category) => {
    set({ isSaving: true });

    try {
      await deleteCategoryRecord(category.id);

      const plantsToUpdate = get().plants.filter((plant) =>
        (plant.category || []).some((plantCategory) => sameCategory(plantCategory, category.name)),
      );

      await Promise.all(
        plantsToUpdate.map((plant) =>
          updatePlantRecord(plant.id, {
            ...plant,
            category: (plant.category || []).filter(
              (plantCategory) => !sameCategory(plantCategory, category.name),
            ),
          }),
        ),
      );

      await get().refreshAll();
      get().showToast("Category deleted \u2713");
    } catch (error) {
      get().showToast("Failed to save. Please try again.");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));
