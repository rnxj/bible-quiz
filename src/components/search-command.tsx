"use client";

import { useAvailableBooks } from "@/hooks/use-quiz-data";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { ArrowRight, Book, Moon, Search, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { BookInfo } from "@/types/quiz";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

const Kbd = ({ children, className }: KbdProps) => (
  <kbd
    className={cn(
      "inline-flex min-w-[1.75em] items-center justify-center rounded-[0.35em] bg-gray-50 px-2 pb-0 pt-0 font-mono text-[0.75em] leading-[1.7em] text-gray-900",
      "shadow-[inset_0_-0.05em_0.5em_rgba(0,0,0,0.05),inset_0_0.05em_rgba(255,255,255,0.6),inset_0_0.25em_0.5em_rgba(0,0,0,0.05),inset_0_-0.05em_rgba(0,0,0,0.2),0_0_0_0.05em_rgba(0,0,0,0.2),0_0.08em_0.17em_rgba(0,0,0,0.2)]",
      "dark:bg-gray-900 dark:text-gray-50",
      "dark:shadow-[inset_0_-0.05em_0.5em_rgba(255,255,255,0.1),inset_0_0.05em_rgba(255,255,255,0.2),inset_0_0.25em_0.5em_rgba(255,255,255,0.05),inset_0_-0.1em_rgba(0,0,0,0.8),0_0_0_0.075em_rgba(255,255,255,0.2),0_0.08em_0.17em_rgba(0,0,0,0.9)]",
      "transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:shadow-[inset_0_-0.05em_0.6em_rgba(0,0,0,0.08),inset_0_0.05em_rgba(255,255,255,0.7),inset_0_0.3em_0.6em_rgba(0,0,0,0.08),inset_0_-0.05em_rgba(0,0,0,0.3),0_0_0_0.07em_rgba(0,0,0,0.2),0_0.1em_0.2em_rgba(0,0,0,0.3)] dark:hover:bg-gray-800",
      className,
    )}
  >
    {children}
  </kbd>
);

interface SearchCommandProps {
  onClick?: (open: boolean, setOpen: (open: boolean) => void) => void;
}

export function SearchCommand({ onClick }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const [isMac, setIsMac] = React.useState<boolean | null>(null);
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const { books: availableBooks, loading } = useAvailableBooks(locale);
  const t = useTranslations("Search");

  React.useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());

    if (matchIndex !== -1) {
      const start = Math.max(0, matchIndex - 50);
      const end = Math.min(text.length, matchIndex + query.length + 50);
      const truncatedText = text.slice(start, end);

      return truncatedText.split(regex).map((part, i) =>
        regex.test(part) ? (
          <mark key={`${part}-${i * 1}`} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        ) : (
          part
        ),
      );
    }

    return text;
  };

  const filterBooks = React.useCallback((books: BookInfo[], search: string) => {
    if (!search) return books;
    return books.filter((book) => {
      const searchLower = search.toLowerCase();
      return book.name.toLowerCase().includes(searchLower);
    });
  }, []);

  const handleButtonClick = () => {
    if (onClick) {
      onClick(open, setOpen);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative flex items-center rounded-full transition-none xl:w-60 xl:justify-start xl:px-3 xl:py-0"
        onClick={handleButtonClick}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">{t("buttonPlaceholder")}</span>
        <div className="ml-auto hidden h-6 select-none items-center gap-1 xl:flex">
          <Kbd>
            {isMac === null ? (
              <span className="text-[16px] opacity-0">⌘</span>
            ) : isMac ? (
              <span className="text-[16px]">⌘</span>
            ) : (
              "Ctrl"
            )}
          </Kbd>
          <Kbd>K</Kbd>
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t("inputPlaceholder")}
          value={search}
          onValueChange={setSearch}
          className="border-b border-border"
        />
        <CommandList className="max-h-[60vh] overflow-y-auto">
          <CommandEmpty className="py-6 text-center text-sm">{t("noResults")}</CommandEmpty>

          <CommandGroup heading={t("navigation")} className="py-2">
            <CommandItem
              onSelect={() => {
                router.push("/");
                setOpen(false);
              }}
              className="group relative m-1 flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:border-border hover:bg-accent hover:pl-4"
            >
              <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <Book className="h-4 w-4 text-blue-500" />
              <div className="flex-grow">{t("home")}</div>
              <ArrowRight className="h-4 w-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading={t("theme")} className="py-2">
            <CommandItem
              onSelect={() => {
                setTheme(theme === "light" ? "dark" : "light");
                setOpen(false);
              }}
              className="group relative m-1 flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:border-border hover:bg-accent hover:pl-4"
            >
              <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-purple-500" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
              <div className="flex-grow">
                {theme === "light" ? t("toggleDarkMode") : t("toggleLightMode")}
              </div>
              <ArrowRight className="h-4 w-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </CommandItem>
          </CommandGroup>

          {!loading && (
            <CommandGroup heading={t("availableBooks")} className="py-2">
              {filterBooks(availableBooks, search).map((book) => (
                <CommandItem
                  key={book.id}
                  onSelect={() => {
                    router.push(`/${book.id}/1`);
                    setOpen(false);
                  }}
                  className="group relative m-1 flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-all duration-200 hover:border-border hover:bg-accent hover:pl-4"
                >
                  <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <Book className="h-4 w-4 text-green-500" />
                  <div className="flex flex-col">
                    <div className="font-medium">{highlightMatch(book.name, search)}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
