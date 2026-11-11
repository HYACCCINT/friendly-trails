export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path d="M4.5 23.5 12.5 11l5 7.2 3-4.2 7 9.5Z" fill="#fff" fillOpacity="0.95" />
      <path
        d="M8 27c4-3.5 8.5-.5 15-5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0.1 3.6"
      />
    </svg>
  );
}
