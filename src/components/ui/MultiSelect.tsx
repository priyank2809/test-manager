import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "Choose from Drop-down",
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedNames = options
    .filter((o) => selectedIds.includes(o.id))
    .map((o) => o.name);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left rounded-lg border border-border-light px-4 py-2.5 text-sm bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2"
      >
        <span
          className={
            selectedNames.length
              ? "text-text-primary truncate"
              : "text-text-placeholder"
          }
        >
          {selectedNames.length ? selectedNames.join(", ") : placeholder}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-text-secondary shrink-0" />
      </button>

      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-border-light bg-bg-page shadow-lg">
          {options.length === 0 && (
            <div className="px-4 py-2.5 text-sm text-text-secondary">
              No options available
            </div>
          )}
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-semi-white cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="accent-brand"
              />
              <span className="text-text-primary">{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}