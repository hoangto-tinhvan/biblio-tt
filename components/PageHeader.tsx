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
        {/* CLB logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.avif" alt="CLB Bóng bàn BIBLIO" className="w-10 h-10 object-contain" />
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
