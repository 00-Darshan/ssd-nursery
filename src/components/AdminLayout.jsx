import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import Toast from "./Toast";
import { usePlantStore } from "../store/plantStore";

export default function AdminLayout() {
  const toast = usePlantStore((state) => state.toast);

  return (
    <div className="min-h-screen bg-cream">
      <AdminNavbar />
      <Outlet />
      <Toast message={toast} />
    </div>
  );
}
