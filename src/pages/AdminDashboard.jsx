import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolvePlantImage, usePlantImageStore } from "../store/plantImageStore";
import { loadPlants, savePlants } from "../utils/plantStore";

export default function AdminDashboard() {
  const [plants, setPlants] = useState(() => loadPlants());
  const imageCache = usePlantImageStore((state) => state.imageCache);
  const loadingIds = usePlantImageStore((state) => state.loadingIds);
  const fetchImagesForPlants = usePlantImageStore((state) => state.fetchImagesForPlants);

  useEffect(() => {
    fetchImagesForPlants(plants);
  }, [fetchImagesForPlants, plants]);

  const handleDelete = (plant) => {
    const shouldDelete = window.confirm(`Delete ${plant.name}?`);
    if (!shouldDelete) return;

    const nextPlants = plants.filter((item) => item.id !== plant.id);
    savePlants(nextPlants);
    setPlants(nextPlants);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-leaf-700">Plants</p>
          <h2 className="text-3xl font-extrabold text-leaf-900">Plant List</h2>
        </div>
        <Link
          to="/admin/add"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white shadow-soft transition hover:bg-leaf-700"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add New Plant
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-leaf-50 text-xs font-extrabold uppercase tracking-wider text-leaf-900">
              <tr>
                <th className="px-5 py-4">Photo</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Kannada Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leaf-100">
              {plants.map((plant) => {
                const imageUrl = resolvePlantImage(plant, imageCache);

                return (
                  <tr key={plant.id} className="align-middle">
                    <td className="px-5 py-4">
                      {loadingIds[plant.id] ? (
                        <div className="h-16 w-20 animate-pulse rounded-2xl bg-leaf-100" />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={plant.name}
                          className="h-16 w-20 rounded-2xl object-cover"
                          crossOrigin="anonymous"
                        />
                      )}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-leaf-900">{plant.name}</td>
                    <td className="px-5 py-4 font-bold text-loam">{plant.kannada_name}</td>
                    <td className="px-5 py-4 text-stone-600">
                      {plant.category.join(", ") || "Uncategorized"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/edit/${plant.id}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-white px-3 text-sm font-extrabold text-loam transition hover:bg-leaf-50"
                        >
                          <Edit aria-hidden="true" className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(plant)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
