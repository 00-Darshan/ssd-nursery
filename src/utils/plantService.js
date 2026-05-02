import { assertSupabaseConfigured, supabase } from "../lib/supabase";
import { toCategoryName } from "./plantStore";

export const normalizePlantFromDb = (plant) => ({
  ...plant,
  category: Array.isArray(plant?.categories) ? plant.categories : [],
  categories: Array.isArray(plant?.categories) ? plant.categories : [],
  benefits: Array.isArray(plant?.benefits) ? plant.benefits : [],
  image: plant?.image_url || "",
  image_url: plant?.image_url || "",
});

export const toPlantPayload = (plantData) => ({
  name: plantData.name,
  kannada_name: plantData.kannada_name,
  scientific_name: plantData.scientific_name,
  categories: (plantData.categories || plantData.category || []).map(toCategoryName).filter(Boolean),
  placement: plantData.placement,
  origin: plantData.origin,
  benefits: plantData.benefits || [],
  description: plantData.description,
  image_url: plantData.image_url || plantData.image || "",
});

const throwIfError = ({ error }) => {
  if (error) {
    throw error;
  }
};

export async function getAllPlants() {
  assertSupabaseConfigured();
  const response = await supabase.from("plants").select("*").order("created_at");
  throwIfError(response);
  return (response.data || []).map(normalizePlantFromDb);
}

export async function getPlantById(id) {
  assertSupabaseConfigured();
  const response = await supabase.from("plants").select("*").eq("id", id).single();
  throwIfError(response);
  return normalizePlantFromDb(response.data);
}

export async function addPlant(plantData) {
  assertSupabaseConfigured();
  const response = await supabase.from("plants").insert([toPlantPayload(plantData)]).select();
  throwIfError(response);
  return normalizePlantFromDb(response.data?.[0]);
}

export async function updatePlant(id, plantData) {
  assertSupabaseConfigured();
  const response = await supabase
    .from("plants")
    .update(toPlantPayload(plantData))
    .eq("id", id)
    .select();
  throwIfError(response);
  return normalizePlantFromDb(response.data?.[0]);
}

export async function deletePlant(id) {
  assertSupabaseConfigured();
  const response = await supabase.from("plants").delete().eq("id", id);
  throwIfError(response);
}

export async function getAllCategories() {
  assertSupabaseConfigured();
  const response = await supabase.from("categories").select("*").order("name");
  throwIfError(response);
  return response.data || [];
}

export async function addCategory(name) {
  assertSupabaseConfigured();
  const response = await supabase.from("categories").insert([{ name }]).select();
  throwIfError(response);
  return response.data?.[0];
}

export async function deleteCategory(id) {
  assertSupabaseConfigured();
  const response = await supabase.from("categories").delete().eq("id", id);
  throwIfError(response);
}
