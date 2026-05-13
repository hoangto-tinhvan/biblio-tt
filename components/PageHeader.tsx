interface Props {
  title: string;
}

export default function PageHeader({ title }: Props) {
  return (
    <div
      className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
    >
      <div className="flex items-center gap-2 justify-center">
        {/* Table tennis paddle + ball SVG */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paddle head */}
          <circle cx="13" cy="13" r="10" fill="#E53E3E" />
          <circle cx="13" cy="13" r="10" stroke="#C53030" strokeWidth="0.5" />
          {/* Rubber surface lines */}
          <line x1="6" y1="8" x2="20" y2="8" stroke="#FC8181" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="4" y1="11" x2="22" y2="11" stroke="#FC8181" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="3" y1="14" x2="23" y2="14" stroke="#FC8181" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="4" y1="17" x2="22" y2="17" stroke="#FC8181" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="6" y1="20" x2="20" y2="20" stroke="#FC8181" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          {/* Handle */}
          <rect x="18" y="20" width="5" height="11" rx="2.5" transform="rotate(-35 18 20)" fill="#92400E" stroke="#78350F" strokeWidth="0.5" />
          {/* Ball */}
          <circle cx="26" cy="7" r="5" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M22 6 Q26 3 30 6" stroke="#CBD5E0" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M22 8 Q26 11 30 8" stroke="#CBD5E0" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">
            CLB Bóng bàn BIBLIO
          </p>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{title}</h1>
        </div>
      </div>
    </div>
  );
}
