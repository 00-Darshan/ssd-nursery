import defaultPlants from "../data/plants.json";

export const PLANTS_STORAGE_KEY = "greenPick_plants";

export const PLANT_CATEGORIES = [
  "indoor",
  "outdoor",
  "sun",
  "shade",
  "medicinal",
  "ornamental",
];

export const PLACEMENTS = ["sun", "shade", "both"];

const isBrowser = () => typeof window !== "undefined";

const normalizePlant = (plant) => ({
  ...plant,
  category: Array.isArray(plant.category) ? plant.category : [],
  benefits: Array.isArray(plant.benefits) ? plant.benefits : [],
  placement: PLACEMENTS.includes(plant.placement) ? plant.placement : "shade",
});

export function loadPlants() {
  if (!isBrowser()) {
    return defaultPlants.map(normalizePlant);
  }

  const savedPlants = window.localStorage.getItem(PLANTS_STORAGE_KEY);

  if (!savedPlants) {
    return defaultPlants.map(normalizePlant);
  }

  try {
    const parsedPlants = JSON.parse(savedPlants);
    return Array.isArray(parsedPlants)
      ? parsedPlants.map(normalizePlant)
      : defaultPlants.map(normalizePlant);
  } catch {
    return defaultPlants.map(normalizePlant);
  }
}

export function savePlants(plants) {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    PLANTS_STORAGE_KEY,
    JSON.stringify(plants.map(normalizePlant)),
  );
}

export function getNextPlantId(plants) {
  return plants.reduce((largestId, plant) => Math.max(largestId, Number(plant.id) || 0), 0) + 1;
}

export function findPlantById(plants, plantId) {
  return plants.find((plant) => String(plant.id) === String(plantId));
}

export function createEmptyPlant() {
  return {
    id: "",
    name: "",
    kannada_name: "",
    scientific_name: "",
    category: [],
    placement: "sun",
    origin: "",
    benefits: [],
    description: "",
    image: "",
    image_mode: "auto",
  };
}
