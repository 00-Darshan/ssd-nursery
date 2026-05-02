import { Edit, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolvePlantImage, usePlantImageStore } from "../store/plantImageStore";
import { usePlantStore } from "../store/plantStore";

export default function AdminDashboard() {
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const plants = usePlantStore((state) => state.plants);
  const categories = usePlantStore((state) => state.categories);
  const isLoading = usePlantStore((state) => state.isLoading);
  const isSaving = usePlantStore((state) => state.isSaving);
  const removePlant = usePlantStore((state) => state.removePlant);
  const createCategory = usePlantStore((state) => state.createCategory);
  const removeCategory = usePlantStore((state) => state.removeCategory);
  const imageCache = usePlantImageStore((state) => state.imageCache);
  const loadingIds = usePlantImageStore((state) => state.loadingIds);
  const fetchImagesForPlants = usePlantImageStore((state) => state.fetchImagesForPlants);

  useEffect(() => {
    if (plants.length) {
      fetchImagesForPlants(plants);
    }
  }, [fetchImagesForPlants, plants]);

  const handleDeletePlant = async (plant) => {
    const shouldDelete = window.confirm(`Delete ${plant.name}?`);
    if (!shouldDelete) return;

    try {
      await removePlant(plant.id);
    } catch {}
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    const nextCategory = categoryDraft.trim();

    if (!nextCategory) {
      setCategoryError("Category name is required.");
      return;
    }

    if (nextCategory.length > 30) {
      setCategoryError("Category must be 30 characters or fewer.");
      return;
    }

    const isDuplicate = categories.some(
      (category) =>
        category.name.toLocaleLowerCase() === nextCategory.toLocaleLowerCase(),
    );

    if (isDuplicate) {
      setCategoryError("This category already exists.");
      return;
    }

    setCategoryError("");
    try {
      await createCategory(nextCategory);
      setCategoryDraft("");
    } catch {}
  };

  const handleDeleteCategory = async (category) => {
    const shouldDelete = window.confirm(
      "Deleting this category will not delete plants in it, but they will lose this category tag",
    );
    if (!shouldDelete) return;

    try {
      await removeCategory(category);
    } catch {}
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section>
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

        <div className="overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-card">
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <LoaderCircle
                        aria-hidden="true"
                        className="mx-auto h-8 w-8 animate-spin text-leaf-600"
                      />
                      <p className="mt-3 font-extrabold text-leaf-900">Loading plants...</p>
                    </td>
                  </tr>
                ) : (
                  plants.map((plant) => {
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
                          {(plant.category || []).join(", ") || "Uncategorized"}
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
                              onClick={() => handleDeletePlant(plant)}
                              disabled={isSaving}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:text-stone-300"
                            >
                              <Trash2 aria-hidden="true" className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-leaf-100 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-extrabold uppercase tracking-wider text-leaf-700">
            Plant Categories
          </p>
          <h2 className="text-2xl font-extrabold text-leaf-900">Manage Categories</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-leaf-50 px-3 py-1 text-sm font-bold text-leaf-900"
            >
              {category.name}
              <button
                type="button"
                onClick={() => handleDeleteCategory(category)}
                disabled={isSaving}
                aria-label={`Delete ${category.name}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:text-stone-300"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="new-category">
            Add Category
          </label>
          <input
            id="new-category"
            value={categoryDraft}
            onChange={(event) => setCategoryDraft(event.target.value)}
            type="text"
            maxLength={30}
            placeholder="Add Category"
            className="h-12 flex-1 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add
          </button>
        </form>
        {categoryError && <p className="mt-3 text-sm font-bold text-red-600">{categoryError}</p>}
      </section>
    </main>
  );
}
