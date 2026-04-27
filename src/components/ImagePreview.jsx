import { Image } from "lucide-react";
import { DEFAULT_PLANT_IMAGE } from "../utils/fetchPlantImage";

export default function ImagePreview({ src, alt = "Plant preview", isLoading = false }) {
  if (isLoading) {
    return (
      <div className="flex aspect-[4/3] w-full animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-leaf-50 via-leaf-100 to-emerald-50" />
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-leaf-100 bg-leaf-50">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_PLANT_IMAGE;
          }}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-500">
          <Image aria-hidden="true" className="h-10 w-10 text-leaf-600" />
          <p className="mt-3 text-sm font-bold">Image preview</p>
        </div>
      )}
    </div>
  );
}
