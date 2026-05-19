import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // ExcelJS and jsPDF/html2canvas are already lazy-loaded chunks — suppress
    // the false-positive warning for those intentionally large async bundles.
    chunkSizeWarningLimit: 1000,
  },
});
