const formatter = new Intl.NumberFormat('en-PK', {maximumFractionDigits: 0})

/** Formats a PKR amount as "Rs 12,500". */
export function formatPrice(amount: number | undefined | null): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'No price'
  return `Rs ${formatter.format(amount)}`
}
