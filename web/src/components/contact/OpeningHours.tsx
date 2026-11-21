/**
 * Opening hours from Site settings. Lines like "Mon–Sat: 11am – 9pm" become a tidy
 * two-column list; anything else is shown as written.
 */
export function OpeningHours({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  // Split on the first ": " only, so times like "11:00" stay intact.
  const rows = lines.map((line) => {
    const i = line.indexOf(": ");
    return i > 0 ? { day: line.slice(0, i), hours: line.slice(i + 2) } : null;
  });

  if (rows.some((row) => row === null)) {
    return <p className="whitespace-pre-line">{lines.join("\n")}</p>;
  }

  return (
    <dl className="divide-y divide-line">
      {rows.map((row) =>
        row ? (
          <div
            key={row.day}
            className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
          >
            <dt className="text-muted">{row.day}</dt>
            <dd className="text-right font-medium tabular-nums">{row.hours}</dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}
