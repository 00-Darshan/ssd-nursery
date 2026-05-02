import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPlants() {
  try {
    // Read plants.json
    const plantsPath = path.join(__dirname, "../src/data/plants.json");
    const plantsData = JSON.parse(fs.readFileSync(plantsPath, "utf-8"));

    console.log(`📦 Found ${plantsData.length} plants to upload...`);

    // Transform plants data to match Supabase schema
    const transformedPlants = plantsData.map((plant) => ({
      name: plant.name,
      kannada_name: plant.kannada_name,
      scientific_name: plant.scientific_name,
      categories: Array.isArray(plant.category) ? plant.category : [],
      placement: plant.placement,
      origin: plant.origin,
      benefits: Array.isArray(plant.benefits) ? plant.benefits : [],
      description: plant.description,
      image_url: plant.image || "",
    }));

    // Clear existing plants (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing plants...");
    await supabase.from("plants").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert plants in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < transformedPlants.length; i += batchSize) {
      const batch = transformedPlants.slice(i, i + batchSize);
      const { data, error } = await supabase.from("plants").insert(batch).select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        continue;
      }

      console.log(`✅ Uploaded batch ${i / batchSize + 1} (${batch.length} plants)`);
    }

    console.log("\n🎉 All plants uploaded successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedPlants();
