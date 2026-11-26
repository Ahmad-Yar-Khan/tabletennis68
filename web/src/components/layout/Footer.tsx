import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { FacebookIcon } from "@/components/ui/icons/FacebookIcon";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { Logo } from "@/components/ui/Logo";
import { displayPhone, telHref } from "@/lib/contact";
import type { Category, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

type FooterProps = {
  categories: Category[];
  settings: SiteSettings | null;
};

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-md text-muted-light transition-colors hover:text-white";

/** Site footer: shop info, categories, contact, info links, socials, copyright. Empty fields are hidden. */
export function Footer({ categories, settings }: FooterProps) {
  const shopName = settings?.shopName || "tabletennis68";
  const s = settings ?? ({} as Partial<SiteSettings>);
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-oxblood pt-6 text-white [--slant:1.5rem] slant-top sm:pt-10 sm:[--slant:2.5rem]">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {/* Shop info */}
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-light">
            Table tennis rackets, blades, rubbers and accessories. Browse online
            and order on WhatsApp.
          </p>
          {(s.instagramUrl || s.facebookUrl) && (
            <ul className="mt-5 flex gap-2" aria-label="Social media">
              {s.instagramUrl && (
                <SocialLink href={s.instagramUrl} label="Instagram">
                  <InstagramIcon className="size-5" />
                </SocialLink>
              )}
              {s.facebookUrl && (
                <SocialLink href={s.facebookUrl} label="Facebook">
                  <FacebookIcon className="size-5" />
                </SocialLink>
              )}
            </ul>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <FooterColumn title="Shop">
            <ul>
              {categories.map((c) => (
                <li key={c._id}>
                  <Link href={`/category/${c.slug}/`} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop/"
                  className={cn(linkClass, "font-medium text-white")}
                >
                  All products
                </Link>
              </li>
            </ul>
          </FooterColumn>
        )}

        {/* Contact */}
        <FooterColumn title="Contact">
          <ul>
            {s.whatsappNumber && (
              <li>
                <a
                  href={buildWhatsAppLink(
                    s.whatsappNumber,
                    greetingMessage(shopName),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-whatsapp" />
                  WhatsApp {displayPhone(s.whatsappNumber)}
                </a>
              </li>
            )}
            {s.phone && (
              <li>
                <a href={telHref(s.phone)} className={linkClass}>
                  <Phone aria-hidden className="size-4 shrink-0" />
                  {s.phone}
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <a
                  href={`mailto:${s.email}`}
                  className={cn(linkClass, "break-all")}
                >
                  <Mail aria-hidden className="size-4 shrink-0" />
                  {s.email}
                </a>
              </li>
            )}
            <li>
              <Link
                href="/contact/"
                className={cn(linkClass, "font-medium text-white")}
              >
                Contact page
              </Link>
            </li>
          </ul>
        </FooterColumn>

        {/* Info */}
        <FooterColumn title="Info">
          <ul>
            <li>
              <Link href="/about/" className={linkClass}>
                About us
              </Link>
            </li>
            <li>
              <Link href="/enquiry/" className={linkClass}>
                Order list
              </Link>
            </li>
          </ul>
        </FooterColumn>
      </Container>

      {/* Extra bottom padding on phones keeps the floating WhatsApp button off this text. */}
      <div className="border-t border-white/15">
        <Container className="py-5 pr-24 text-xs text-muted-light sm:pr-8">
          © {year} {shopName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg tracking-wide uppercase">{title}</h2>
      {children}
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-red"
      >
        {children}
      </a>
    </li>
  );
}
