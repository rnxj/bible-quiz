import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className }: ProgressBarProps) => {
  const [width, setWidth] = useState(0);

  // Calculate percentage with a smooth animation
  useEffect(() => {
    const percentage = (current / total) * 100;

    // Small delay to allow for animation
    const timeout = setTimeout(() => {
      setWidth(percentage);
    }, 100);

    return () => clearTimeout(timeout);
  }, [current, total]);

  return (
    <div className={cn("w-full bg-secondary rounded-full h-2 overflow-hidden", className)}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
};
