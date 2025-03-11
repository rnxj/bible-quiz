"use client";

import { Button } from "@/components/ui/button";
import { TabTrigger, TabsRoot } from "@/components/ui/hover-tabs";
import { useHasRendered } from "@/hooks/use-has-rendered";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const themeOptions = [
  {
    value: "light",
    icon: Sun,
    label: "Light theme",
  },
  {
    value: "dark",
    icon: Moon,
    label: "Dark theme",
  },
  {
    value: "system",
    icon: Monitor,
    label: "System theme",
  },
];

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const hasRendered = useHasRendered();

  if (!hasRendered) {
    return (
      <div className="inline-flex items-center rounded-full border border-border bg-background p-0.5 shadow-sm backdrop-blur-md">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 animate-pulse rounded-full"
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{option.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <TabsRoot value={theme ?? "system"} onValueChange={setTheme} layoutId="theme-switcher">
      {themeOptions.map((option) => {
        const Icon = option.icon;
        return (
          <TabTrigger key={option.value} value={option.value} size="icon" className="h-8 w-8 p-0">
            <Icon className="h-4 w-4" />
            <span className="sr-only">{option.label}</span>
          </TabTrigger>
        );
      })}
    </TabsRoot>
  );
}
