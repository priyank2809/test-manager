import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "./Icons";

interface StyledSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          {...rest}
          className={`w-full appearance-none rounded-lg border border-border-light px-4 py-2.5 pr-9 text-sm bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand ${className}`}
        >
          {children}
        </select>
        <ChevronDownIcon className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;