import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { findPlantById, loadPlants, savePlants } from "../utils/plantStore";

export default function AdminEditPlant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const plants = useMemo(() => loadPlants(), []);
  const plant = findPlantById(plants, id);

  const handleSave = async (updatedPlant) => {
    const latestPlants = loadPlants();
    const nextPlants = latestPlants.map((item) =>
      String(item.id) === String(id) ? { ...updatedPlant, id: item.id } : item,
    );

    savePlants(nextPlants);
    navigate("/admin");
  };

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
      submitLabel="Update Plant"
      onSave={handleSave}
      onCancel={() => navigate("/admin")}
    />
  );
}
