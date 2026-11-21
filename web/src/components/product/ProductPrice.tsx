import { cn, formatPrice, isOnSale } from "@/lib/utils";

type ProductPriceProps = {
  price: number;
  salePrice?: number | null;
  size?: "sm" | "lg";
  className?: string;
};

/** Price, or sale price in red with the old price struck through. */
export function ProductPrice({
  price,
  salePrice,
  size = "sm",
  className,
}: ProductPriceProps) {
  const onSale = isOnSale({ price, salePrice });

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums",
        className,
      )}
    >
      {onSale ? (
        <>
          <span
            className={cn(
              "font-medium text-red",
              size === "lg" ? "text-2xl" : "text-base",
            )}
          >
            <span className="sr-only">Now </span>
            {formatPrice(salePrice as number)}
          </span>
          <s
            className={cn("text-muted", size === "lg" ? "text-lg" : "text-sm")}
          >
            <span className="sr-only">Was </span>
            {formatPrice(price)}
          </s>
        </>
      ) : (
        <span
          className={cn(
            "font-medium text-ink",
            size === "lg" ? "text-2xl" : "text-base",
          )}
        >
          {formatPrice(price)}
        </span>
      )}
    </p>
  );
}
