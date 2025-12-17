export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" stopOpacity={1} />
          <stop offset="100%" stopColor="#475569" stopOpacity={1} />
        </linearGradient>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#grad1)" opacity="0.1" />

      {/* Performance Graph Line */}
      <path
        d="M 20 70 L 35 55 L 50 40 L 65 30 L 80 20"
        stroke="url(#grad1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Data Points */}
      <circle cx="20" cy="70" r="5" fill="#1e293b" />
      <circle cx="35" cy="55" r="5" fill="#334155" />
      <circle cx="50" cy="40" r="5" fill="#475569" />
      <circle cx="65" cy="30" r="5" fill="#64748b" />
      <circle cx="80" cy="20" r="6" fill="#0f172a" />

      {/* Code Brackets */}
      <path
        d="M 30 75 L 25 80 L 30 85"
        stroke="#1e293b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 70 75 L 75 80 L 70 85"
        stroke="#475569"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

