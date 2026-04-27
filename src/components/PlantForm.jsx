import { RefreshCw, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BenefitInput from "./BenefitInput";
import ImagePreview from "./ImagePreview";
import { DEFAULT_PLANT_IMAGE, fetchPlantImage } from "../utils/fetchPlantImage";
import { PLACEMENTS, PLANT_CATEGORIES, createEmptyPlant } from "../utils/plantStore";

const inputClass =
  "h-12 w-full rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400";

const labelClass = "text-sm font-extrabold text-leaf-900";

const toTitle = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function PlantForm({ title, initialPlant, submitLabel, onSave, onCancel }) {
  const normalizedInitialPlant = useMemo(
    () => ({
      ...createEmptyPlant(),
      ...initialPlant,
      category: Array.isArray(initialPlant?.category) ? initialPlant.category : [],
      benefits: Array.isArray(initialPlant?.benefits) ? initialPlant.benefits : [],
      image_mode: initialPlant?.image_mode || "auto",
    }),
    [initialPlant],
  );

  const [form, setForm] = useState(normalizedInitialPlant);
  const [autoImageUrl, setAutoImageUrl] = useState(
    normalizedInitialPlant.image_mode === "auto" ? normalizedInitialPlant.image : "",
  );
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(normalizedInitialPlant);
    setAutoImageUrl(
      normalizedInitialPlant.image_mode === "auto" ? normalizedInitialPlant.image : "",
    );
  }, [normalizedInitialPlant]);

  useEffect(() => {
    if (form.image_mode !== "auto") {
      setIsFetchingImage(false);
      return undefined;
    }

    const plantName = form.name.trim();
    if (plantName.length < 3) {
      setAutoImageUrl("");
      setIsFetchingImage(false);
      return undefined;
    }

    let isActive = true;
    setIsFetchingImage(true);

    const timer = window.setTimeout(async () => {
      const imageUrl = await fetchPlantImage(plantName);
      if (isActive) {
        setAutoImageUrl(imageUrl);
        setIsFetchingImage(false);
      }
    }, 700);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [form.image_mode, form.name]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleCategory = (category) => {
    setForm((current) => {
      const hasCategory = current.category.includes(category);
      return {
        ...current,
        category: hasCategory
          ? current.category.filter((item) => item !== category)
          : [...current.category, category],
      };
    });
  };

  const refreshAutoImage = async () => {
    if (!form.name.trim()) return;

    setIsFetchingImage(true);
    setAutoImageUrl(await fetchPlantImage(form.name));
    setIsFetchingImage(false);
  };

  const validate = () => {
    if (!form.name.trim() || !form.kannada_name.trim() || !form.scientific_name.trim()) {
      return "Common Name, Kannada Name, and Scientific Name are required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    let imageUrl = form.image.trim();
    if (form.image_mode === "auto") {
      imageUrl = autoImageUrl || (await fetchPlantImage(form.name));
    }

    await onSave({
      ...form,
      name: form.name.trim(),
      kannada_name: form.kannada_name.trim(),
      scientific_name: form.scientific_name.trim(),
      origin: form.origin.trim(),
      description: form.description.trim(),
      image: imageUrl || DEFAULT_PLANT_IMAGE,
      benefits: form.benefits.map((benefit) => benefit.trim()).filter(Boolean),
    });

    setIsSaving(false);
  };

  const previewImage = form.image_mode === "auto" ? autoImageUrl : form.image.trim();

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-leaf-700">Plant</p>
          <h2 className="text-3xl font-extrabold text-leaf-900">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-extrabold text-loam transition hover:bg-leaf-50"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          Cancel
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5 rounded-3xl border border-leaf-100 bg-white p-5 shadow-card sm:p-6">
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>Common Name</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                type="text"
                required
                className={inputClass}
              />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Kannada Name</span>
              <input
                value={form.kannada_name}
                onChange={(event) => updateField("kannada_name", event.target.value)}
                type="text"
                required
                className={inputClass}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className={labelClass}>Scientific Name</span>
            <input
              value={form.scientific_name}
              onChange={(event) => updateField("scientific_name", event.target.value)}
              type="text"
              required
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={labelClass}>Placement</span>
              <select
                value={form.placement}
                onChange={(event) => updateField("placement", event.target.value)}
                className={inputClass}
              >
                {PLACEMENTS.map((placement) => (
                  <option key={placement} value={placement}>
                    {placement === "both" ? "Sun / Shade" : toTitle(placement)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Origin</span>
              <input
                value={form.origin}
                onChange={(event) => updateField("origin", event.target.value)}
                type="text"
                className={inputClass}
              />
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className={labelClass}>Category</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PLANT_CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-3 text-sm font-bold capitalize text-loam"
                >
                  <input
                    checked={form.category.includes(category)}
                    onChange={() => toggleCategory(category)}
                    type="checkbox"
                    className="h-4 w-4 rounded border-leaf-300 text-leaf-600"
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <span className={labelClass}>Benefits</span>
            <BenefitInput
              benefits={form.benefits}
              onChange={(benefits) => updateField("benefits", benefits)}
            />
          </div>

          <label className="block space-y-2">
            <span className={labelClass}>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-3 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400"
            />
          </label>
        </section>

        <aside className="h-max space-y-5 rounded-3xl border border-leaf-100 bg-white p-5 shadow-card sm:p-6">
          <div>
            <p className={labelClass}>Image</p>
            <div className="mt-3 grid grid-cols-2 rounded-2xl bg-leaf-50 p-1">
              {[
                ["auto", "Auto-fetch"],
                ["custom", "Custom URL"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField("image_mode", value)}
                  className={`h-10 rounded-xl text-sm font-extrabold transition ${
                    form.image_mode === value
                      ? "bg-white text-leaf-900 shadow-card"
                      : "text-stone-600 hover:text-leaf-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.image_mode === "auto" ? (
            <button
              type="button"
              onClick={refreshAutoImage}
              disabled={!form.name.trim() || isFetchingImage}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-extrabold text-loam transition hover:bg-leaf-50 disabled:cursor-not-allowed disabled:text-stone-300"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${isFetchingImage ? "animate-spin" : ""}`}
              />
              Fetch Preview
            </button>
          ) : (
            <label className="block space-y-2">
              <span className={labelClass}>Image URL</span>
              <input
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                type="url"
                placeholder="https://example.com/plant.jpg"
                className={inputClass}
              />
            </label>
          )}

          <ImagePreview src={previewImage} alt={form.name || "Plant preview"} isLoading={isFetchingImage} />

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white shadow-soft transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </aside>
      </div>
    </form>
  );
}
