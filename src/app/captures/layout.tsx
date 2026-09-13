import "@/components/app/app-ui.css";

export default function CapturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-ui min-h-dvh bg-[#f5f5f7] py-6">{children}</div>
  );
}
