import type { ProductSpec } from "@/lib/types";

/** Specifications as a two-column table (label | value). Hidden when there are none. */
export function ProductSpecs({ specs }: { specs: ProductSpec[] }) {
  const rows = specs.filter((s) => s.label && s.value);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="specs-heading">
      <h2 id="specs-heading" className="mb-3 text-2xl uppercase">
        Specifications
      </h2>
      <div className="overflow-hidden rounded-card border border-line bg-white">
        <table className="w-full text-left text-sm sm:text-base">
          <tbody className="divide-y divide-line">
            {rows.map((spec) => (
              <tr key={spec._key} className="even:bg-paper/60">
                <th
                  scope="row"
                  className="w-2/5 px-4 py-3 align-top font-medium text-muted"
                >
                  {spec.label}
                </th>
                <td className="px-4 py-3 text-ink tabular-nums">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
