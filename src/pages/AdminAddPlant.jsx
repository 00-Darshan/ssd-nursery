import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { createEmptyPlant, getNextPlantId, loadPlants, savePlants } from "../utils/plantStore";

export default function AdminAddPlant() {
  const navigate = useNavigate();
  const initialPlant = useMemo(() => createEmptyPlant(), []);

  const handleSave = async (plant) => {
    const plants = loadPlants();
    const nextPlant = {
      ...plant,
      id: getNextPlantId(plants),
    };

    savePlants([...plants, nextPlant]);
    navigate("/admin");
  };

  return (
    <PlantForm
      title="Add New Plant"
      initialPlant={initialPlant}
      submitLabel="Save Plant"
      onSave={handleSave}
      onCancel={() => navigate("/admin")}
    />
  );
}
