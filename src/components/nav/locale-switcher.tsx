"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Locale, localeMap as locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/hook";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
  const currentLocale = useLocale();

  const handleLocaleChange = async (newLocale: Locale) => {
    await setUserLocale(newLocale);
  };

  return (
    <Select defaultValue={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[180px] rounded-full">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(locales).map(([locale, label]) => (
          <SelectItem key={locale} value={locale}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
