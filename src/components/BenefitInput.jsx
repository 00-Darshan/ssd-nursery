import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function BenefitInput({ benefits, onChange }) {
  const [draft, setDraft] = useState("");

  const addBenefit = () => {
    const nextBenefit = draft.trim();
    if (!nextBenefit || benefits.includes(nextBenefit)) return;

    onChange([...benefits, nextBenefit]);
    setDraft("");
  };

  const removeBenefit = (benefitToRemove) => {
    onChange(benefits.filter((benefit) => benefit !== benefitToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addBenefit();
            }
          }}
          type="text"
          placeholder="Add a benefit"
          className="h-12 flex-1 rounded-2xl border border-leaf-100 bg-white px-4 text-sm font-medium text-loam shadow-card transition placeholder:text-stone-400 focus:border-leaf-400"
        />
        <button
          type="button"
          onClick={addBenefit}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 text-sm font-extrabold text-white transition hover:bg-leaf-700"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add
        </button>
      </div>

      {benefits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit) => (
            <span
              key={benefit}
              className="inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-leaf-50 px-3 py-1 text-sm font-bold text-leaf-900"
            >
              {benefit}
              <button
                type="button"
                onClick={() => removeBenefit(benefit)}
                aria-label={`Remove ${benefit}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-red-600"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
