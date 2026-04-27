import { Leaf, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="border-b border-leaf-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-600 text-white shadow-card">
            <Leaf aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-leaf-700">
              GreenPick
            </p>
            <h1 className="text-xl font-extrabold text-leaf-900">GreenPick Admin</h1>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-extrabold text-loam transition hover:bg-leaf-50"
          >
            View Site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-loam px-4 text-sm font-extrabold text-white transition hover:bg-stone-800"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
