export default function ShieldCrest({ size = 36, color = '#dcaf61' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 2L4 10V28C4 39.5 13 49.5 24 54C35 49.5 44 39.5 44 28V10L24 2Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 10L14 14V26C14 32.5 18.5 38 24 41C29.5 38 34 32.5 34 26V14L24 10Z"
        fill={color}
        opacity="0.25"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontSize="14"
        fontWeight="700"
        fill={color}
      >
        S
      </text>
    </svg>
  );
}
