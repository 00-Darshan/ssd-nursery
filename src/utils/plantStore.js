export const PLANTS_STORAGE_KEY = "greenPick_plants";

export const PLACEMENTS = ["sun", "shade", "both"];

export const toCategoryName = (category) => {
  const value = String(category || "").trim();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

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
    categories: [],
    placement: "sun",
    origin: "",
    benefits: [],
    description: "",
    image: "",
    image_url: "",
    image_mode: "upload",
  };
}
