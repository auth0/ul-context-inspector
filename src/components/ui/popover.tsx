"use client";

import { createPortal } from "react-dom";
import * as React from "react";
import { cn } from "../../lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  triggerRect: DOMRect | null;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (newOpen && triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
      setUncontrolledOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !contentRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      // Prevent background scrolling when popover is open
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        // Restore scrolling when popover is closed
        document.body.style.overflow = "";
      };
    }
  }, [open, setOpen]);

  const contextValue: PopoverContextValue = {
    open,
    setOpen,
    triggerRef,
    contentRef,
    triggerRect,
  };

  return (
    <PopoverContext.Provider value={contextValue} data-slot="popover">
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  asChild?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

function PopoverTrigger({ className, onClick, asChild, children, ...props }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopoverContext();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    setOpen(!open);
  };

  const isChildButton = (() => {
    if (!React.isValidElement(children)) return false;
    const t: unknown = children.type;
    if (t === "button") return true;
    if (typeof t === "function") {
      const fn = t as { name?: string; displayName?: string };
      const name = fn.name?.toLowerCase() || fn.displayName?.toLowerCase();
      if (name && name.includes("button")) return true;
    }
    return Boolean(children.props?.role === "button" || children.props?.type === "button");
  })();

  const shouldUseAsChild = asChild || isChildButton;

  if (shouldUseAsChild) {
    if (!React.isValidElement(children)) {
      throw new Error("PopoverTrigger: asChild requires a valid React element as child");
    }

    return React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      "data-slot": "popover-trigger",
      "data-state": open ? "open" : "closed",
      onClick: handleClick,
      className: cn((children as React.ReactElement).props.className),
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      data-slot="popover-trigger"
      data-state={open ? "open" : "closed"}
      className={cn(
        "uci-inline-flex uci-mb-2",
        props.disabled && "uci-pointer-events-none",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function PopoverContent({
  children,
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const { open, contentRef, triggerRect } = usePopoverContext();

  React.useEffect(() => {
    if (open && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else {
        contentRef.current.focus();
      }
    }
  }, [open, contentRef]);

  if (!open || !triggerRect) return null;

  const { top, left, width, height } = triggerRect;

  const cssProps = {
    "--trigger-top": `${top}px`,
    "--trigger-left": `${left}px`,
    "--trigger-width": `${width}px`,
    "--trigger-height": `${height}px`,
    "--side-offset": `${sideOffset}px`,
  } as React.CSSProperties;

  const getPositionClasses = () => {
    const baseClasses = "uci-fixed uci-z-50";

    const sideClasses = {
      top: "uci-bottom-[calc(100vh-var(--trigger-top)+var(--side-offset))]",
      bottom: "uci-top-[calc(var(--trigger-top)+var(--trigger-height)+var(--side-offset))]",
      left: "uci-right-[calc(100vw-var(--trigger-left)+var(--side-offset))] uci-top-[var(--trigger-top)]",
      right: "uci-left-[calc(var(--trigger-left)+var(--trigger-width)+var(--side-offset))] uci-top-[var(--trigger-top)]",
    };

    const alignClasses = {
      top: {
        start: "uci-left-[var(--trigger-left)]",
        center: "uci-left-[calc(var(--trigger-left)+var(--trigger-width)/2)] uci--translate-x-1/2",
        end: "uci-right-[calc(100vw-var(--trigger-left)-var(--trigger-width))]",
      },
      bottom: {
        start: "uci-left-[var(--trigger-left)]",
        center: "uci-left-[calc(var(--trigger-left)+var(--trigger-width)/2)] uci--translate-x-1/2",
        end: "uci-right-[calc(100vw-var(--trigger-left)-var(--trigger-width))]",
      },
      left: {
        start: "uci-top-[var(--trigger-top)]",
        center: "uci-top-[calc(var(--trigger-top)+var(--trigger-height)/2)] uci--translate-y-1/2",
        end: "uci-bottom-[calc(100vh-var(--trigger-top)-var(--trigger-height))]",
      },
      right: {
        start: "uci-top-[var(--trigger-top)]",
        center: "uci-top-[calc(var(--trigger-top)+var(--trigger-height)/2)] uci--translate-y-1/2",
        end: "uci-bottom-[calc(100vh-var(--trigger-top)-var(--trigger-height))]",
      },
    };

    return `${baseClasses} ${sideClasses[side]} ${alignClasses[side][align]}`;
  };

  const getOriginClasses = () => {
    const originMap = {
      top: {
        start: "uci-origin-bottom-left",
        center: "uci-origin-bottom",
        end: "uci-origin-bottom-right",
      },
      bottom: {
        start: "uci-origin-top-left",
        center: "uci-origin-top",
        end: "uci-origin-top-right",
      },
      left: {
        start: "uci-origin-top-right",
        center: "uci-origin-right",
        end: "uci-origin-bottom-right",
      },
      right: {
        start: "uci-origin-top-left",
        center: "uci-origin-left",
        end: "uci-origin-bottom-left",
      },
    };

    return originMap[side][align];
  };

  const content = (
    <div className="uci-portal-scope">
      <div
        ref={contentRef}
        data-slot="popover-content"
        data-state={open ? "open" : "closed"}
        data-side={side}
        data-align={align}
        tabIndex={-1}
        className={cn(
          "uci-bg-[#171717] uci-text-white uci-border-solid uci-border-2 !uci-border-[#2A2A2A] uci-animate-in uci-fade-in-0 uci-zoom-in-95 data-[state=open]:uci-animate-in data-[state=closed]:uci-animate-out data-[state=closed]:uci-fade-out-0 data-[state=open]:uci-fade-in-0 data-[state=closed]:uci-zoom-out-95 data-[state=open]:uci-zoom-in-95 data-[side=bottom]:uci-slide-in-from-top-2 data-[side=left]:uci-slide-in-from-right-2 data-[side=right]:uci-slide-in-from-left-2 data-[side=top]:uci-slide-in-from-bottom-2 uci-w-72 uci-overflow-hidden uci-rounded uci-ring-0 uci-outline-hidden uci-duration-150 uci-ease-in-out uci-outline-none focus:uci-outline-none",
          getPositionClasses(),
          getOriginClasses(),
          className
        )}
        style={cssProps}
        {...props}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function PopoverAnchor({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
