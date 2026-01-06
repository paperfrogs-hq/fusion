import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const links = [
    { label: "Privacy", path: "/privacy" },
    { label: "Terms", path: "/terms" },
    { label: "Contact", path: "/contact" },
    { label: "Whitepaper", path: "/whitepaper" },
  ];

  return (
    <footer className="py-16 border-t border-border/50 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-start gap-0">
            <span className="font-display font-bold text-lg" style={{color: "#0DFF0D"}}>
              Fusion
            </span>
            <span className="text-muted-foreground text-sm">
              by Paperfrogs HQ
            </span>
          </div>

          <nav className="flex items-center gap-8">
            {links.map((link) => (
              <motion.a
                key={link.label}
                href={link.path}
                onClick={handleNavigation(link.path)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{
                  scale: 1.05,
                  color: "hsl(var(--primary))",
                }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2026 Paperfrogs HQ. All rights reserved.
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </footer>
  );
};

export default Footer;