"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboardIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserAvatar() {
  const router = useRouter();
  const session = authClient.useSession();
  const t = useTranslations("UserAvatar");

  if (session.isPending) {
    return (
      <div className="h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all animate-pulse" />
    );
  }

  if (!session.data) {
    return (
      <Button asChild className="flex items-center gap-1 rounded-full">
        <Link href="/auth/login">
          <UserIcon className="h-4 w-4 mr-1" />
          {t("signIn")}
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.data?.user?.image || ""} alt="Profile" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {session.data?.user?.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.data?.user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.data?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <LayoutDashboardIcon className="h-4 w-4 mr-2" />
            {t("dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut();
            router.push("/auth/login");
          }}
          className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
