"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <motion.main
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-6 sm:p-24"
    >
      <div className="w-full max-w-md text-center">
        <motion.svg
          className="mx-auto mb-6 w-full max-w-[300px]"
          fill="none"
          viewBox="-80 0 369 271"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <title>404</title>
          <path
            clipRule="evenodd"
            d="M108.36 2.48l105.7 185.47H2.66L108.35 2.48z"
            className="fill-background stroke-muted-foreground/30"
            fillRule="evenodd"
            strokeDasharray="4 4"
            strokeWidth="2"
          />
          <g filter="url(#filter0_d)">
            <ellipse cx="182.68" cy="156.48" className="fill-background" rx="74.32" ry="74.52" />
            <path
              d="M256.5 156.48c0 40.88-33.05 74.02-73.82 74.02-40.77 0-73.83-33.14-73.83-74.02 0-40.87 33.06-74.01 73.83-74.01 40.77 0 73.82 33.14 73.82 74.01z"
              className="stroke-foreground/20"
            />
          </g>
          <mask height="150" id="a" maskUnits="userSpaceOnUse" width="149" x="108" y="81">
            <ellipse cx="182.68" cy="156.48" fill="#fff" rx="74.32" ry="74.52" />
          </mask>
          <g mask="url(#a)">
            <path
              clipRule="evenodd"
              d="M108.36 2.48l105.7 185.47H2.66L108.35 2.48z"
              className="fill-foreground dark:fill-foreground"
              fillRule="evenodd"
            />
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="213.03"
              id="filter0_d"
              width="212.65"
              x="76.35"
              y="57.97"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="8" />
              <feGaussianBlur stdDeviation="16" />
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
          </defs>
        </motion.svg>

        <motion.h1
          className="mb-4 text-4xl font-bold tracking-tight"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("title")}
        </motion.h1>
        <motion.p
          className="mb-6 text-muted-foreground lg:text-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {t("description")}
        </motion.p>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button variant="outline" size="lg" className="mb-8" asChild>
            <Link href="/">{t("returnHome")}</Link>
          </Button>
        </motion.div>
      </div>
    </motion.main>
  );
}
