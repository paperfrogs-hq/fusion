interface SectionBadgeProps {
  children: React.ReactNode;
}

const SectionBadge = ({ children }: SectionBadgeProps) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </div>
  );
};

export default SectionBadge;
