import { Link as LinkIcon, LoaderCircle, RefreshCw, Save, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BenefitInput from "./BenefitInput";
import ImagePreview from "./ImagePreview";
import { DEFAULT_PLANT_IMAGE, fetchPlantImage } from "../utils/fetchPlantImage";
import { PLACEMENTS, createEmptyPlant, toCategoryName } from "../utils/plantStore";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "../utils/storageService";

const inputClass =
  "h-12 w-full rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400";

const labelClass = "text-sm font-extrabold text-leaf-900";

const toTitle = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const sameCategory = (left, right) =>
  String(left || "").trim().toLocaleLowerCase() ===
  String(right || "").trim().toLocaleLowerCase();

export default function PlantForm({
  title,
  initialPlant,
  categories = [],
  submitLabel,
  onSave,
  onCancel,
}) {
  const normalizedInitialPlant = useMemo(() => {
    const categoryValues = initialPlant?.category || initialPlant?.categories || [];
    const imageUrl = initialPlant?.image_url || initialPlant?.image || "";

    return {
      ...createEmptyPlant(),
      ...initialPlant,
      category: Array.isArray(categoryValues) ? categoryValues : [],
      categories: Array.isArray(categoryValues) ? categoryValues : [],
      benefits: Array.isArray(initialPlant?.benefits) ? initialPlant.benefits : [],
      image: imageUrl,
      image_url: imageUrl,
      image_mode: initialPlant?.image_mode || "upload",
    };
  }, [initialPlant]);

  const [form, setForm] = useState(normalizedInitialPlant);
  const [imageFile, setImageFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [unsplashQuery, setUnsplashQuery] = useState(normalizedInitialPlant.name);
  const [fetchedImageUrl, setFetchedImageUrl] = useState("");
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(normalizedInitialPlant);
    setUnsplashQuery(normalizedInitialPlant.name);
    setFetchedImageUrl("");
    setImageFile(null);
    setUploadPreview("");
  }, [normalizedInitialPlant]);

  useEffect(
    () => () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    },
    [uploadPreview],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleCategory = (categoryName) => {
    setForm((current) => {
      const hasCategory = current.category.some((category) =>
        sameCategory(category, categoryName),
      );
      const nextCategories = hasCategory
        ? current.category.filter((item) => !sameCategory(item, categoryName))
        : [...current.category, categoryName];

      return {
        ...current,
        category: nextCategories,
        categories: nextCategories,
      };
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const fetchUnsplashImage = async () => {
    const query = unsplashQuery.trim() || form.name.trim();
    if (!query) return;

    setIsFetchingImage(true);
    setFetchedImageUrl(await fetchPlantImage(query));
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

    try {
      let imageUrl = form.image_url || form.image || "";

      if (form.image_mode === "auto") {
        imageUrl = fetchedImageUrl || (await fetchPlantImage(unsplashQuery || form.name));
      }

      if (form.image_mode === "custom") {
        imageUrl = form.image_url.trim();
      }

      await onSave({
        plant: {
          ...form,
          name: form.name.trim(),
          kannada_name: form.kannada_name.trim(),
          scientific_name: form.scientific_name.trim(),
          origin: form.origin.trim(),
          description: form.description.trim(),
          category: form.category.map(toCategoryName).filter(Boolean),
          categories: form.category.map(toCategoryName).filter(Boolean),
          image: imageUrl || DEFAULT_PLANT_IMAGE,
          image_url: imageUrl || DEFAULT_PLANT_IMAGE,
          benefits: form.benefits.map((benefit) => benefit.trim()).filter(Boolean),
        },
        imageFile,
        imageMode: form.image_mode,
      });
    } catch (saveError) {
      setError(saveError.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentImage = form.image_url || form.image;
  const previewImage =
    form.image_mode === "upload"
      ? uploadPreview || currentImage
      : form.image_mode === "auto"
        ? fetchedImageUrl || currentImage
        : form.image_url.trim();

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
                onChange={(event) => {
                  updateField("name", event.target.value);
                  setUnsplashQuery(event.target.value);
                }}
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
            {categories.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-3 text-sm font-bold text-loam"
                  >
                    <input
                      checked={form.category.some((item) => sameCategory(item, category.name))}
                      onChange={() => toggleCategory(category.name)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-leaf-300 text-leaf-600"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-bold text-stone-600">
                Add categories from the admin dashboard before assigning them.
              </p>
            )}
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
            <div className="mt-3 grid grid-cols-3 rounded-2xl bg-leaf-50 p-1">
              {[
                ["upload", "Upload"],
                ["auto", "Unsplash"],
                ["custom", "URL"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField("image_mode", value)}
                  className={`h-10 rounded-xl text-xs font-extrabold transition ${
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

          {form.image_mode === "upload" && (
            <label className="block space-y-2">
              <span className={labelClass}>Upload from device</span>
              <span className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-extrabold text-loam transition hover:bg-leaf-50">
                <Upload aria-hidden="true" className="h-4 w-4" />
                Choose image
              </span>
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          )}

          {form.image_mode === "auto" && (
            <div className="space-y-3">
              <label className="block space-y-2">
                <span className={labelClass}>Unsplash search</span>
                <input
                  value={unsplashQuery}
                  onChange={(event) => setUnsplashQuery(event.target.value)}
                  type="text"
                  className={inputClass}
                />
              </label>
              <button
                type="button"
                onClick={fetchUnsplashImage}
                disabled={!unsplashQuery.trim() || isFetchingImage}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-extrabold text-loam transition hover:bg-leaf-50 disabled:cursor-not-allowed disabled:text-stone-300"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={`h-4 w-4 ${isFetchingImage ? "animate-spin" : ""}`}
                />
                Fetch Image
              </button>
            </div>
          )}

          {form.image_mode === "custom" && (
            <label className="block space-y-2">
              <span className={labelClass}>Image URL</span>
              <div className="relative">
                <LinkIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf-700"
                />
                <input
                  value={form.image_url}
                  onChange={(event) => updateField("image_url", event.target.value)}
                  type="url"
                  placeholder="https://example.com/plant.jpg"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </label>
          )}

          <ImagePreview
            src={previewImage}
            alt={form.name || "Plant preview"}
            isLoading={isFetchingImage || (isSaving && form.image_mode === "upload" && imageFile)}
          />

          {isSaving && form.image_mode === "upload" && imageFile && (
            <p className="inline-flex items-center gap-2 text-sm font-extrabold text-leaf-700">
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              Uploading image...
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white shadow-soft transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {isSaving ? (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </aside>
      </div>
    </form>
  );
}
