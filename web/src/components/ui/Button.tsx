import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-red text-white hover:bg-crimson active:bg-crimson",
  secondary: "bg-ink text-white hover:bg-oxblood active:bg-oxblood",
  outline:
    "border-2 border-ink/15 bg-white text-ink hover:border-ink hover:bg-paper",
  // Inherits the surrounding text colour, so it works on light and dark backgrounds.
  ghost: "hover:bg-current/10 active:bg-current/15",
  whatsapp: "bg-whatsapp text-ink hover:bg-whatsapp-dark",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-sm",
  md: "h-11 gap-2 px-5 text-base",
  lg: "h-13 gap-2.5 px-7 text-lg",
  icon: "size-11",
};

type VariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/** Button classes, for elements that should look like a button but aren't <Button>. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: VariantOptions = {}): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-pill font-medium whitespace-nowrap transition select-none active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-[1.15em] [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

type CommonProps = VariantOptions & {
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  children?: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    disabled?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function isExternal(href: string): boolean {
  return (
    /^(https?:)?\/\//.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

/**
 * Site button. Pass `href` to render a link that looks like a button
 * (external and wa.me links open in a new tab).
 */
export function Button(props: ButtonProps) {
  const {
    variant,
    size,
    fullWidth,
    className,
    loading = false,
    children,
    ...rest
  } = props;
  const classes = buttonVariants({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading && <LoaderCircle aria-hidden className="animate-spin" />}
      {children}
    </>
  );

  if (rest.href !== undefined) {
    const { href, disabled, ...anchorProps } = rest as Omit<
      ButtonAsLink,
      keyof CommonProps
    >;

    // A disabled link can't be "disabled" in HTML, so render a real disabled button instead.
    if (disabled || loading) {
      return (
        <button
          type="button"
          disabled
          aria-busy={loading || undefined}
          className={classes}
        >
          {content}
        </button>
      );
    }

    if (isExternal(href)) {
      const opensTab = /^(https?:)?\/\//.test(href);
      return (
        <a
          href={href}
          {...(opensTab
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...anchorProps}
          className={classes}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} {...anchorProps} className={classes}>
        {content}
      </Link>
    );
  }

  const {
    type = "button",
    disabled,
    ...buttonProps
  } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
      className={classes}
    >
      {content}
    </button>
  );
}
