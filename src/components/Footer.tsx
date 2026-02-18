import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const links = [
    { label: "Whitepaper", path: "/whitepaper" },
    { label: "Contact", path: "/contact" },
    { label: "Privacy", path: "/privacy" },
    { label: "Terms", path: "/terms" },
  ];

  return (
    <footer className="relative border-t border-border/80 py-12 sm:py-14">
      <Container wide>
        <motion.div
          className="surface-panel flex flex-col gap-8 p-7 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center">
            <img src="/Logo-01-transparent.png" alt="Fusion logo" className="fusion-logo-lockup h-14 w-[210px] shrink-0 sm:h-16 sm:w-[240px]" />
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={handleNavigation(link.path)}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-sm text-muted-foreground">
            <p>© 2026 Fusion. All rights reserved.</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em]">Built by Paperfrogs HQ</p>
          </div>
        </motion.div>
      </Container>
    </footer>
  );
};

export default Footer;
