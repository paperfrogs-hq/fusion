import { Link } from "react-router-dom";

import { Container } from "@/components/ui/container";

const links = [
  { label: "APC", path: "/apc" },
  { label: "Waitlist", path: "/waitlist" },
  { label: "Paperfrogs HQ", path: "/paperfrogs-hq" },
  { label: "Terms", path: "/terms" },
  { label: "Privacy", path: "/privacy" },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-rule py-14 sm:py-16">
      <Container wide>
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl italic text-foreground">Fusion</span>
              <span aria-hidden="true" className="block h-3 w-px bg-rule" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                by Paperfrogs
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hairline" />

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            Fusion · A trust layer for AI audio
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;