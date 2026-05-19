import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { usePlantStore } from "../store/plantStore";
import { updatePlant } from "../utils/plantService";
import { createEmptyPlant } from "../utils/plantStore";
import { uploadPlantGalleryImages, uploadPlantImage } from "../utils/storageService";

export default function AdminAddPlant() {
  const navigate = useNavigate();
  const categories = usePlantStore((state) => state.categories);
  const createPlant = usePlantStore((state) => state.createPlant);
  const refreshPlants = usePlantStore((state) => state.refreshPlants);
  const showToast = usePlantStore((state) => state.showToast);
  const initialPlant = useMemo(() => createEmptyPlant(), []);

  const handleSave = async ({ plant, imageFile, imageMode, additionalImageFiles, existingGalleryImages }) => {
    let imageUrl = plant.image_url;

    if (imageMode === "upload" && imageFile) {
      try {
        imageUrl = await uploadPlantImage(imageFile);
      } catch (error) {
        showToast("Failed to save. Please try again.");
        throw error;
      }
    }

    const createdPlant = await createPlant({
      ...plant,
      image: imageUrl,
      image_url: imageUrl,
    });

    // Upload gallery images now that we have the plant ID
    const allGalleryUrls = [...(existingGalleryImages || [])];
    if (additionalImageFiles?.length > 0 && createdPlant?.id) {
      try {
        const newUrls = await uploadPlantGalleryImages(additionalImageFiles, createdPlant.id);
        allGalleryUrls.push(...newUrls);
      } catch {
        // gallery upload failed — proceed without gallery images
      }
    }

    if (allGalleryUrls.length > 0 && createdPlant?.id) {
      await updatePlant(createdPlant.id, { ...createdPlant, images: allGalleryUrls });
      await refreshPlants();
    }

    navigate("/admin");
  };

  return (
    <PlantForm
      title="Add New Plant"
      initialPlant={initialPlant}
      categories={categories}
      submitLabel="Save Plant"
      onSave={handleSave}
      onCancel={() => navigate("/admin")}
    />
  );
}
