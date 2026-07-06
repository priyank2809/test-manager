import { forwardRef } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "./Icons";

interface NumberStepperProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
}

const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
  ({ value, onValueChange, className = "", ...rest }, ref) => {
    const step = () => (isNaN(value) ? 0 : value);

    return (
      <div className="relative">
        <input
          ref={ref}
          type="number"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className={`w-full rounded-lg border border-border-light pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
          {...rest}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onValueChange(step() + 1)}
            className="text-text-secondary hover:text-brand leading-none"
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onValueChange(step() - 1)}
            className="text-text-secondary hover:text-brand leading-none"
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    );
  }
);

NumberStepper.displayName = "NumberStepper";

export default NumberStepper;