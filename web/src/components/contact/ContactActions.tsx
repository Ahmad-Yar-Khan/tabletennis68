import { ArrowUpRight, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { displayPhone, telHref } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

type ContactActionsProps = {
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  shopName: string;
};

/** Big WhatsApp / Call / Email tiles at the top of the contact page. Missing ones are hidden. */
export function ContactActions({
  whatsappNumber,
  phone,
  email,
  shopName,
}: ContactActionsProps) {
  if (!whatsappNumber && !phone && !email) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {whatsappNumber && (
        <ActionTile
          href={buildWhatsAppLink(whatsappNumber, greetingMessage(shopName))}
          newTab
          icon={<WhatsAppIcon className="size-7" />}
          label="WhatsApp"
          value={displayPhone(whatsappNumber)}
          hint="Quickest way to order or ask"
          tone="whatsapp"
        />
      )}
      {phone && (
        <ActionTile
          href={telHref(phone)}
          icon={<Phone aria-hidden className="size-6" />}
          label="Call us"
          value={phone}
          hint="Talk to us directly"
          tone="dark"
        />
      )}
      {email && (
        <ActionTile
          href={`mailto:${email}`}
          icon={<Mail aria-hidden className="size-6" />}
          label="Email"
          value={email}
          hint="For bulk or club enquiries"
          tone="light"
        />
      )}
    </ul>
  );
}

const toneClasses = {
  whatsapp: {
    tile: "bg-whatsapp text-ink hover:bg-whatsapp-dark",
    icon: "bg-ink/10",
    hint: "text-ink/75",
  },
  dark: {
    tile: "bg-ink text-white hover:bg-oxblood",
    icon: "bg-white/10 text-coral",
    hint: "text-muted-light",
  },
  light: {
    tile: "border border-line bg-white text-ink hover:border-ink",
    icon: "bg-blush text-crimson",
    hint: "text-muted",
  },
} as const;

function ActionTile({
  href,
  newTab = false,
  icon,
  label,
  value,
  hint,
  tone,
}: {
  href: string;
  newTab?: boolean;
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: keyof typeof toneClasses;
}) {
  const t = toneClasses[tone];
  return (
    <li>
      <a
        href={href}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn(
          "group relative flex h-full items-center gap-4 rounded-card p-4 shadow-card transition active:scale-[0.99] sm:flex-col sm:items-start sm:p-6",
          t.tile,
        )}
      >
        <span
          className={cn(
            "inline-flex size-14 shrink-0 -skew-x-6 items-center justify-center rounded-xl",
            t.icon,
          )}
        >
          <span className="skew-x-6">{icon}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl leading-tight font-extrabold uppercase italic sm:text-3xl">
            {label}
          </span>
          <span className="block truncate font-medium">{value}</span>
          <span className={cn("mt-0.5 block text-sm", t.hint)}>{hint}</span>
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:absolute sm:top-5 sm:right-5"
        />
      </a>
    </li>
  );
}
