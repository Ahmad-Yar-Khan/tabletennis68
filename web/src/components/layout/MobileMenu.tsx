"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useHasOpened } from "@/lib/hooks/useHasOpened";
import type { Brand, Category } from "@/lib/types";

type MobileMenuProps = {
  categories: Category[];
  brands: Brand[];
  whatsappNumber: string | null;
  shopName: string;
};

// The drawer (and Motion, which animates it) is downloaded only when the menu is first wanted.
const loadDrawer = () => import("./MobileMenuDrawer");
const MobileMenuDrawer = dynamic(
  () => loadDrawer().then((mod) => mod.MobileMenuDrawer),
  { ssr: false },
);

/** Hamburger button (below lg) that opens the site menu in a left drawer. */
export function MobileMenu({
  categories,
  brands,
  whatsappNumber,
  shopName,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const mounted = useHasOpened(open);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        // Start the download on intent, so the drawer is usually ready by the time of the tap.
        onPointerDown={() => void loadDrawer()}
        onPointerEnter={() => void loadDrawer()}
        onFocus={() => void loadDrawer()}
        onClick={() => setOpen(true)}
        className="-ml-2 lg:hidden"
      >
        <Menu aria-hidden className="size-6!" />
      </Button>
      {mounted && (
        <MobileMenuDrawer
          open={open}
          onClose={() => setOpen(false)}
          categories={categories}
          brands={brands}
          whatsappNumber={whatsappNumber}
          shopName={shopName}
        />
      )}
    </>
  );
}
