import { Check, Minus } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange" | "defaultChecked"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [internalChecked, setInternalChecked] = React.useState<boolean | "indeterminate">(defaultChecked ?? false);

    const isControlled = checked !== undefined;
    const checkedValue = isControlled ? checked : internalChecked;

    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    const isIndeterminate = checkedValue === "indeterminate";
    const isChecked = checkedValue === true;

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    const handleChange = (newChecked: boolean) => {
      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    const handleClick = () => {
      if (props.disabled) return;

      const newChecked = !isChecked;
      handleChange(newChecked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          role="checkbox"
          aria-checked={isIndeterminate ? "mixed" : isChecked}
          data-state={isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
          data-slot="checkbox"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={props.disabled}
          className={cn(
            "uci-group uci-shadow-checkbox-resting uci-peer hover:uci-shadow-checkbox-hover focus-visible:uci-ring-ring hover:uci-border-primary/50 uci-border-border data-[state=checked]:uci-bg-primary data-[state=indeterminate]:uci-border-primary data-[state=indeterminate]:uci-bg-primary data-[state=checked]:uci-text-primary-foreground data-[state=checked]:uci-border-primary focus-visible:uci-border-ring aria-invalid:uci-ring-destructive/20 dark:aria-invalid:uci-ring-destructive/40 aria-invalid:uci-border-destructive uci-relative uci-flex uci-size-6 uci-shrink-0 uci-appearance-none uci-items-center uci-justify-center uci-rounded-lg uci-border uci-transition-[colors,shadow] uci-duration-150 uci-ease-in-out uci-outline-none focus-visible:uci-ring-3 disabled:uci-cursor-not-allowed disabled:uci-opacity-50",
            className
          )}
          {...(props.id && { id: props.id })}
        >
          <span
            data-slot="checkbox-indicator"
            className="group-data-[state=checked]:uci-animate-in group-data-[state=unchecked]:uci-animate-out group-data-[state=unchecked]:uci-fade-out-0 group-data-[state=checked]:uci-fade-in-0 group-data-[state=unchecked]:uci-slide-out-to-bottom-5 group-data-[state=unchecked]:uci-zoom-out-75 group-data-[state=checked]:uci-zoom-in-75 group-data-[state=checked]:uci-slide-in-from-bottom-5 uci-text-primary-foreground uci-stroke-primary-foreground uci-absolute uci-duration-150 uci-ease-in-out uci-hidden group-data-[state=checked]:uci-flex group-data-[state=indeterminate]:uci-flex"
          >
            {isIndeterminate ? (
              <Minus className="uci-size-3 uci-stroke-[4px]" absoluteStrokeWidth />
            ) : (
              <Check className="uci-size-3 uci-stroke-[4px]" absoluteStrokeWidth />
            )}
          </span>
        </button>

        <input
          ref={combinedRef}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleChange(e.target.checked)}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            clip: "rect(0px, 0px, 0px, 0px)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            position: "fixed",
            top: 0,
            left: 0,
            border: 0,
            padding: 0,
            width: "1px",
            height: "1px",
            margin: "-1px",
          }}
          {...props}
        />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
