/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import { type ButtonProps, buttonVariants } from "@/components/ui/button";

interface TabsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  layoutId: string;
}

const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(
  ({ className, children, value, onValueChange, layoutId, ...props }, ref) => {
    const [hoveredValue, setHoveredValue] = React.useState(value);

    React.useEffect(() => {
      setHoveredValue(value);
    }, [value]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border border-border bg-background p-0.5 shadow-sm backdrop-blur-md",
          className,
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        {...(props as any)}
      >
        <AnimatePresence mode="wait">
          {React.Children.map(children, (child) => {
            if (React.isValidElement<TabTriggerProps>(child)) {
              return React.cloneElement(child, {
                hoveredValue,
                setHoveredValue,
                activeValue: value,
                onValueChange,
                layoutId,
              });
            }
            return child;
          })}
        </AnimatePresence>
      </motion.div>
    );
  },
);
TabsRoot.displayName = "TabsRoot";

interface TabTriggerProps extends Omit<ButtonProps, "value" | "onChange"> {
  value: string;
  hoveredValue?: string;
  activeValue?: string;
  setHoveredValue?: (value: string) => void;
  onValueChange?: (value: string) => void;
  layoutId?: string;
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  (
    {
      className,
      children,
      value,
      hoveredValue,
      activeValue,
      setHoveredValue,
      onValueChange,
      layoutId,
      size = "default",
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          ref={ref}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size,
              className: "relative hover:bg-transparent",
            }),
            className,
          )}
          onClick={() => onValueChange?.(value)}
          onMouseOver={() => setHoveredValue?.(value)}
          onMouseLeave={() => setHoveredValue?.(activeValue ?? value)}
          {...props}
        >
          <span
            className={cn(
              "relative z-10 transition-colors duration-200",
              value !== hoveredValue && "text-muted-foreground",
            )}
          >
            {children}
          </span>
          {value === hoveredValue && (
            <motion.div
              className="absolute inset-0 -z-0 rounded-full bg-secondary"
              layoutId={layoutId}
              aria-hidden="true"
              transition={{
                type: "spring",
                bounce: 0.25,
                stiffness: 130,
                damping: 12,
                duration: 0.3,
              }}
            />
          )}
        </button>
      </motion.div>
    );
  },
);
TabTrigger.displayName = "TabTrigger";

export { TabsRoot, TabTrigger };
