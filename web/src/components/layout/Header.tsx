import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import type { Category, SiteSettings } from "@/lib/types";
import { DesktopNav } from "./DesktopNav";
import { EnquiryButton } from "./EnquiryButton";
import { MobileMenu } from "./MobileMenu";
import { SearchButton } from "./SearchButton";
import { StickyHeader } from "./StickyHeader";

type HeaderProps = {
  categories: Category[];
  settings: SiteSettings | null;
};

/** Site header: menu (mobile), logo, nav (desktop), search and enquiry list. Sticky. */
export function Header({ categories, settings }: HeaderProps) {
  return (
    <StickyHeader>
      <Container className="relative flex h-16 items-center gap-1 lg:h-[4.5rem]">
        <MobileMenu
          categories={categories}
          whatsappNumber={settings?.whatsappNumber ?? null}
          shopName={settings?.shopName || "tabletennis68"}
        />
        <div className="origin-left transition-transform duration-300 group-data-[scrolled=true]:scale-90">
          <Logo />
        </div>
        <DesktopNav categories={categories} className="ml-8 hidden lg:block" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchButton />
          {/* Placeholder count until the enquiry list store exists. */}
          <EnquiryButton count={0} />
        </div>
      </Container>
    </StickyHeader>
  );
}
