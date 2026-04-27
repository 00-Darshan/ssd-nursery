export const DEFAULT_PLANT_IMAGE = "/images/green-placeholder.svg";

const UNSPLASH_ENDPOINT = "https://api.unsplash.com/search/photos";

export async function fetchPlantImage(plantName) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const query = plantName?.trim();

  if (!accessKey || !query) {
    return DEFAULT_PLANT_IMAGE;
  }

  try {
    const url = new URL(UNSPLASH_ENDPOINT);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash request failed with ${response.status}`);
    }

    const data = await response.json();
    return data.results?.[0]?.urls?.regular || DEFAULT_PLANT_IMAGE;
  } catch {
    return DEFAULT_PLANT_IMAGE;
  }
}
