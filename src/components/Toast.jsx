export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-5 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-leaf-900 px-5 py-3 text-center text-sm font-extrabold text-white shadow-soft animate-toast-in sm:left-auto sm:right-5 sm:translate-x-0"
    >
      {message}
    </div>
  );
}
