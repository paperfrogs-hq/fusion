interface SectionBadgeProps {
  children: React.ReactNode;
}

const SectionBadge = ({ children }: SectionBadgeProps) => {
  return (
    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
};

export default SectionBadge;
