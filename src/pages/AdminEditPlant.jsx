import { Link, useNavigate, useParams } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { usePlantStore } from "../store/plantStore";
import { findPlantById } from "../utils/plantStore";
import {
  deletePlantImage,
  isUploadedPlantImage,
  uploadPlantGalleryImages,
  uploadPlantImage,
} from "../utils/storageService";

export default function AdminEditPlant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const plants = usePlantStore((state) => state.plants);
  const categories = usePlantStore((state) => state.categories);
  const isLoading = usePlantStore((state) => state.isLoading);
  const updatePlant = usePlantStore((state) => state.updatePlant);
  const refreshPlants = usePlantStore((state) => state.refreshPlants);
  const showToast = usePlantStore((state) => state.showToast);
  const plant = findPlantById(plants, id);

  const handleSave = async ({ plant: updatedPlant, imageFile, imageMode, additionalImageFiles, existingGalleryImages }) => {
    let imageUrl = updatedPlant.image_url;
    const previousImageUrl = plant.image_url || plant.image;

    if (imageMode === "upload" && imageFile) {
      try {
        if (isUploadedPlantImage(previousImageUrl)) {
          await deletePlantImage(previousImageUrl);
        }
        imageUrl = await uploadPlantImage(imageFile);
      } catch (error) {
        showToast("Failed to save. Please try again.");
        throw error;
      }
    }

    // Upload new gallery images
    const allGalleryUrls = [...(existingGalleryImages || [])];
    if (additionalImageFiles?.length > 0) {
      try {
        const newUrls = await uploadPlantGalleryImages(additionalImageFiles, plant.id);
        allGalleryUrls.push(...newUrls);
      } catch {
        // gallery upload failed — proceed without new gallery images
      }
    }

    await updatePlant(id, {
      ...updatedPlant,
      image: imageUrl,
      image_url: imageUrl,
      images: allGalleryUrls,
    });

    if (additionalImageFiles?.length > 0) {
      await refreshPlants();
    }

    navigate("/admin");
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-leaf-100 bg-white p-8 text-center shadow-card">
          <h2 className="text-2xl font-extrabold text-leaf-900">Loading plant...</h2>
        </section>
      </main>
    );
  }

  if (!plant) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-leaf-100 bg-white p-8 text-center shadow-card">
          <h2 className="text-2xl font-extrabold text-leaf-900">Plant not found</h2>
          <Link
            to="/admin"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white transition hover:bg-leaf-700"
          >
            Back to Admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <PlantForm
      title={`Edit ${plant.name}`}
      initialPlant={plant}
      categories={categories}
      submitLabel="Update Plant"
      onSave={handleSave}
      onCancel={() => navigate("/admin")}
    />
  );
}
