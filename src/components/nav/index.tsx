"use client";

import { SearchCommand } from "@/components/search-command";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { BookOpenIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { UserAvatar } from "./user-avatar";

export const Nav = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const isExpanded = false;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (!isExpanded && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-125%" },
      }}
      animate={isExpanded || !hidden ? "visible" : "hidden"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`sticky z-50 mx-auto flex h-fit items-center justify-between border bg-background p-2 transition-[top,max-width,border-radius] duration-300 ${
        isExpanded
          ? "top-0 max-w-full rounded-none"
          : "top-4 mx-4 container rounded-full xl:mx-auto"
      }`}
    >
      <h1 className={`ml-2 transition-all duration-300 ${isExpanded ? "ml-4" : ""}`}>
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary transition-colors hover:text-primary/90"
        >
          <BookOpenIcon className="h-6 w-6" />
        </Link>
      </h1>
      <NavList isExpanded={isExpanded} />
    </motion.nav>
  );
};

const links: {
  name: string;
  href: string;
}[] = [];

const NavList = ({ isExpanded }: { isExpanded: boolean }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={`flex items-center gap-8 transition-all duration-300 ${isExpanded ? "mr-4" : ""}`}
    >
      <div className="hidden items-center gap-4 text-sm md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              isActiveLink(link.href)
                ? "pointer-events-none text-primary"
                : "text-foreground/80 transition-all hover:-mt-px hover:mb-px hover:text-foreground"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <SearchCommand />
        <div className="hidden md:flex md:items-center md:gap-2">
          <ThemeSwitcher />
          <UserAvatar />
        </div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="border-b border-border p-4 text-center text-lg font-semibold">
                Menu
              </DrawerTitle>
            </DrawerHeader>
            <div className="mt-8 flex flex-col gap-4 px-4 text-center">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`${
                    isActiveLink(link.href)
                      ? "pointer-events-none text-primary"
                      : "text-foreground transition-all hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <DrawerFooter>
              <div className="flex items-center justify-center gap-4">
                <ThemeSwitcher />
                <UserAvatar />
              </div>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full rounded-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
