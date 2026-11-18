/** Thin strip above the header with the owner's announcement. Hidden when empty. */
export function AnnouncementBar({ text }: { text: string | null | undefined }) {
  const message = text?.trim();
  if (!message) return null;

  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-surface sm:text-sm">
      <p className="mx-auto max-w-site">
        <span
          aria-hidden
          className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-ball align-middle"
        />
        {message}
      </p>
    </div>
  );
}
