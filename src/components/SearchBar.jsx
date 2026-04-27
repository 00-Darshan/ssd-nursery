import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">Search plants</span>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-leaf-700"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        placeholder="Search by common, Kannada, or scientific name"
        className="h-14 w-full rounded-2xl border border-leaf-100 bg-white/90 pl-12 pr-4 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400 focus:bg-white"
      />
    </label>
  );
}
