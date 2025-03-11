"use client";

import { useQuizStorageContext } from "@/providers/quiz-storage-provider";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

export function SyncStatusIndicator() {
  const { syncStatus } = useQuizStorageContext();
  const t = useTranslations("SyncStatus");

  // Show toast notifications when sync status changes
  useEffect(() => {
    if (syncStatus === "syncing") {
      toast.loading(t("syncing"), {
        id: "sync-status",
        richColors: true,
      });
    } else if (syncStatus === "success") {
      toast.success(t("syncSuccess"), {
        id: "sync-status",
        duration: 3000,
        richColors: true,
      });
    } else if (syncStatus === "error") {
      toast.error(t("syncError"), {
        id: "sync-status",
        duration: 5000,
        richColors: true,
      });
    }
  }, [syncStatus, t]);

  // Component doesn't render any UI directly
  return null;
}
