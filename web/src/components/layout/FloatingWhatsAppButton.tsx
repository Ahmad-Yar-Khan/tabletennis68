import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { buildWhatsAppLink, greetingMessage } from "@/lib/whatsapp";

type FloatingWhatsAppButtonProps = {
  whatsappNumber: string | null;
  shopName: string;
};

/**
 * Round WhatsApp button fixed bottom-right on every page.
 * Pages with their own sticky bottom bar can lift it by setting `--fab-offset` (e.g. "4.5rem") on <body>.
 */
export function FloatingWhatsAppButton({
  whatsappNumber,
  shopName,
}: FloatingWhatsAppButtonProps) {
  if (!whatsappNumber) return null;

  return (
    <a
      href={buildWhatsAppLink(whatsappNumber, greetingMessage(shopName))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--fab-offset,0px))] z-30 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-ink shadow-lift transition-transform hover:scale-105 active:scale-95 sm:right-6 sm:bottom-[calc(1.5rem+var(--fab-offset,0px))]"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
