export type Locale = (typeof locales)[number];

export const locales = ["en", "ta"] as const;

export const defaultLocale: Locale = "en";

export const localeMap = {
  en: "English",
  ta: "தமிழ்",
};
