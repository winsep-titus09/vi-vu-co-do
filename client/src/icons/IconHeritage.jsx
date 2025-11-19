export default function IconHeritage({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21h18" />
      <path d="M5 21V7" />
      <path d="M19 21V7" />
      <path d="M2 7h20" />
      <path d="M12 2 2 7h20L12 2z" />
      <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}
