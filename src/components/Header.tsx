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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.a 
          href="/" 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            src="/Fusion_Icon-No-BG-01.png"
            alt="Fusion Logo"
            className="h-6 w-auto"
          />
          <span className="font-bold text-foreground">Fusion</span>
        </motion.a>

        <Button variant="hero" size="sm" onClick={handleJoinWaitlist}>
          Join Waitlist
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;