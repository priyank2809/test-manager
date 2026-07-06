import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}