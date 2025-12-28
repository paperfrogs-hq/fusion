import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Header = () => {
  const handleJoinWaitlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const waitlistSection = document.getElementById("waitlist-section");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-4 mt-4">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between rounded-2xl glass-strong">
          <motion.a 
            href="/" 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img
              src="/Fusion_Icon-No-BG-01.png"
              alt="Fusion Logo"
              className="h-24 w-auto"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.a>

          <nav className="hidden md:flex items-center gap-1">
            {["How It Works", "Solutions", "Features"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="hero" size="sm" onClick={handleJoinWaitlist}>
              Join Waitlist
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;