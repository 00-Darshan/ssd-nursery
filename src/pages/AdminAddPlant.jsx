import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { usePlantStore } from "../store/plantStore";
import { createEmptyPlant } from "../utils/plantStore";
import { uploadPlantImage } from "../utils/storageService";

export default function AdminAddPlant() {
  const navigate = useNavigate();
  const categories = usePlantStore((state) => state.categories);
  const createPlant = usePlantStore((state) => state.createPlant);
  const showToast = usePlantStore((state) => state.showToast);
  const initialPlant = useMemo(() => createEmptyPlant(), []);

  const handleSave = async ({ plant, imageFile, imageMode }) => {
    let imageUrl = plant.image_url;

    if (imageMode === "upload" && imageFile) {
      try {
        imageUrl = await uploadPlantImage(imageFile);
      } catch (error) {
        showToast("Failed to save. Please try again.");
        throw error;
      }
    }

    await createPlant({
      ...plant,
      image: imageUrl,
      image_url: imageUrl,
    });
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
