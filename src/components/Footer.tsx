import { motion } from "framer-motion";

const Footer = () => {
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
          <div className="flex items-center gap-2">
            <img 
              src="../././imgs/Fusion-Logo.png" 
              alt="Fusion Logo" 
              className="h-10 w-auto"
            />
            <span className="text-muted-foreground text-sm">
              by Paperfrogs HQ
            </span>
          </div>

          <nav className="flex items-center gap-8">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{
                  scale: 1.05,
                  color: "hsl(var(--primary))",
                }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2025 Paperfrogs HQ. All rights reserved.
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </footer>
  );
};

export default Footer;