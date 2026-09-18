export function NavIcon({ name, className = "h-[18px] w-[18px]" }: { name: string; className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "analyse":
      return (
        <svg {...props}>
          <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
          <path d="M9 3.5v2h6v-2" />
          <path d="m8.7 13 2.2 2.2 4.4-4.6" />
        </svg>
      );
    case "memoire":
      return (
        <svg {...props}>
          <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5l-5-5Z" />
          <path d="M14 3.5v5h5" />
          <path d="M8.5 13h7M8.5 16.5h4.5" />
        </svg>
      );
    case "questionnaires":
      return (
        <svg {...props}>
          <rect x="5" y="4" width="14" height="17" rx="2.5" />
          <path d="M9 4V3.4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4" />
          <path d="m7.8 11 1.4 1.4 2.3-2.6" />
          <path d="M14.5 11.2h2.4" />
          <path d="m7.8 16 1.4 1.4 2.3-2.6" />
          <path d="M14.5 16.2h2.4" />
        </svg>
      );
    case "knowledge":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
          <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
        </svg>
      );
    case "collaboration":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <circle cx="17" cy="9.5" r="2.4" />
          <path d="M16.5 14.6c2.3.3 4 1.9 4 4.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.3 4-1.3 7-4.9 7-9.3V5.8L12 3Z" />
          <path d="m9.2 11.8 2 2 3.8-4" />
        </svg>
      );
    case "grille":
      return (
        <svg {...props}>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
          <path d="M8.5 4.5v15M15.5 4.5v15M4.5 9.5h15M4.5 14.5h15" />
        </svg>
      );
    case "matrice":
      return (
        <svg {...props}>
          <path d="M5 5h14v14H5z" />
          <path d="M9 5v14M15 5v14M5 9h14M5 15h14" />
        </svg>
      );
    case "trame":
      return (
        <svg {...props}>
          <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5l-5-5Z" />
          <path d="M14 3.5v5h5" />
          <path d="M8.5 13h7M8.5 16.5h4.5" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...props}>
          <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
          <path d="M9 3.5v2h6v-2" />
          <path d="m8.7 13 2.2 2.2 4.4-4.6" />
        </svg>
      );
    case "prompts":
      return (
        <svg {...props}>
          <path d="M12 3 5 6v6c0 3.5 3 6 7 7 4-1 7-3.5 7-7V6l-7-3Z" />
          <path d="M9.5 12.5h5M12 10v5" />
        </svg>
      );
    default:
      return null;
  }
}
