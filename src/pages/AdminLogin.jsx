import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const USERNAME = "admin";
const PASSWORD = "Darshan@2027";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("isAdminLoggedIn") === "true") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (username === USERNAME && password === PASSWORD) {
      window.localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin", { replace: true });
      return;
    }

    setError("Invalid credentials");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-leaf-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-600 text-white shadow-card">
            <Leaf aria-hidden="true" className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-leaf-700">
              GreenPick
            </p>
            <h1 className="text-2xl font-extrabold text-leaf-900">Admin Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-leaf-900">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              className="h-12 w-full rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card focus:border-leaf-400"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-leaf-900">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="h-12 w-full rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card focus:border-leaf-400"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white shadow-soft transition hover:bg-leaf-700"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
