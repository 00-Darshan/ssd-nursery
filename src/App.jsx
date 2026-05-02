import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAddPlant from "./pages/AdminAddPlant";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditPlant from "./pages/AdminEditPlant";
import AdminLogin from "./pages/AdminLogin";
import CatalogPage from "./pages/CatalogPage";
import { usePlantStore } from "./store/plantStore";

export default function App() {
  const initialize = usePlantStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add" element={<AdminAddPlant />} />
          <Route path="/admin/edit/:id" element={<AdminEditPlant />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
