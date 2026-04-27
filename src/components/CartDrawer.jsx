import {
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { loadPlants } from "../utils/plantStore";

export default function CartDrawer({ isOpen, onOpen, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removePlant = useCartStore((state) => state.removePlant);
  const clearCart = useCartStore((state) => state.clearCart);
  const itemCount = useCartStore((state) => state.totalQuantity());
  const totalTypes = useCartStore((state) => state.totalTypes());
  const hasItems = items.length > 0;

  const runExport = async (type) => {
    if (!hasItems || isExporting) return;

    setIsExporting(true);
    try {
      const { exportDetailedPDF, exportSimplePDF } = await import("../utils/exportPDF");
      const exporter = type === "simple" ? exportSimplePDF : exportDetailedPDF;
      await exporter(items);
    } finally {
      setIsExporting(false);
    }
  };

  const runExcelExport = async () => {
    if (!hasItems || isExporting) return;

    setIsExporting(true);
    try {
      const { exportToExcel } = await import("../utils/exportExcel");
      const cartItems = items.map((item) => ({
        plantId: item.plant.id,
        quantity: item.quantity,
      }));

      exportToExcel(cartItems, loadPlants());
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open cart with ${itemCount} selected plants`}
        className="fixed bottom-6 right-6 z-30 inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf-600 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf-700"
      >
        <ShoppingCart aria-hidden="true" className="h-7 w-7" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-clay px-2 text-xs font-extrabold text-white ring-4 ring-cream">
            {itemCount}
          </span>
        )}
      </button>

      <div
        className={`fixed inset-0 z-40 bg-loam/45 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-soft transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Plant cart"
      >
        <header className="flex items-center justify-between border-b border-leaf-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-leaf-700">Cart</p>
            <h2 className="text-2xl font-extrabold text-leaf-900">Selected Plants</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-leaf-50 text-loam transition hover:bg-leaf-100"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="drawer-scroll flex-1 overflow-y-auto px-5 py-5">
          {!hasItems ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-leaf-100 bg-leaf-50/60 p-8 text-center">
              <ShoppingCart aria-hidden="true" className="h-10 w-10 text-leaf-600" />
              <p className="mt-4 text-lg font-extrabold text-leaf-900">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.plant.id}
                  className="grid grid-cols-[72px_1fr] gap-4 rounded-3xl border border-leaf-100 bg-white p-3 shadow-card"
                >
                  <img
                    src={item.plant.image}
                    alt={item.plant.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-leaf-900">
                          {item.plant.name}
                        </h3>
                        <p className="truncate text-sm font-bold text-loam">
                          {item.plant.kannada_name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlant(item.plant.id)}
                        aria-label={`Remove ${item.plant.name}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 inline-flex h-10 items-center rounded-2xl border border-leaf-100 bg-leaf-50">
                      <button
                        type="button"
                        onClick={() => decrement(item.plant.id)}
                        aria-label={`Decrease ${item.plant.name} quantity`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-l-2xl text-loam transition hover:bg-white"
                      >
                        <Minus aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2.5rem] px-2 text-center text-sm font-extrabold text-leaf-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.plant.id)}
                        aria-label={`Increase ${item.plant.name} quantity`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-r-2xl text-loam transition hover:bg-white"
                      >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="space-y-4 border-t border-leaf-100 bg-cream px-5 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-stone-600">Plant types selected</span>
            <span className="text-lg font-extrabold text-leaf-900">{totalTypes}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => runExport("simple")}
              disabled={!hasItems || isExporting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-3 py-3 text-center text-xs font-extrabold leading-tight text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Export Simple PDF
            </button>
            <button
              type="button"
              onClick={() => runExport("detailed")}
              disabled={!hasItems || isExporting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-loam px-3 py-3 text-center text-xs font-extrabold leading-tight text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <ClipboardList aria-hidden="true" className="h-4 w-4" />
              Export Detailed PDF
            </button>
            <button
              type="button"
              onClick={runExcelExport}
              disabled={!hasItems || isExporting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-3 py-3 text-center text-xs font-extrabold leading-tight text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <FileSpreadsheet aria-hidden="true" className="h-4 w-4" />
              Export Excel
            </button>
          </div>

          <button
            type="button"
            onClick={clearCart}
            disabled={!hasItems}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-leaf-100 bg-white text-sm font-extrabold text-loam transition hover:bg-leaf-50 disabled:cursor-not-allowed disabled:text-stone-300"
          >
            Clear cart
          </button>
        </footer>
      </aside>
    </>
  );
}
