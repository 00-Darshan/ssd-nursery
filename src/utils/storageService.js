import { assertSupabaseConfigured, supabase } from "../lib/supabase";

const BUCKET_NAME = "plant-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const getStoragePathFromUrl = (imageUrl) => {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const markerIndex = imageUrl?.indexOf(marker) ?? -1;

  if (markerIndex === -1) return "";

  const pathWithQuery = imageUrl.slice(markerIndex + marker.length);
  return decodeURIComponent(pathWithQuery.split("?")[0]);
};

export const isUploadedPlantImage = (imageUrl) => Boolean(getStoragePathFromUrl(imageUrl));

export async function uploadPlantImage(file) {
  assertSupabaseConfigured();

  if (!file) {
    return "";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${Date.now()}-${safeFileName}`;
  const response = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (response.error) {
    throw response.error;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deletePlantImage(imageUrl) {
  assertSupabaseConfigured();
  const storagePath = getStoragePathFromUrl(imageUrl);

  if (!storagePath) return;

  const response = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  if (response.error) {
    throw response.error;
  }
}
