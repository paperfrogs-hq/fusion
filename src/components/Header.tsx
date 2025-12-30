import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Header = () => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sections = ["how-it-works", "solutions", "features"];

    const handleScroll = () => {
      let currentSection = "";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            currentSection = sectionId;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJoinWaitlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const waitlistSection = document.getElementById("waitlist-section");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getLinkClass = (sectionId: string) => {
    const isActive = activeSection === sectionId;
    return `px-4 py-2 text-sm relative transition-colors ${
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-2 sm:mx-4 mt-2 sm:mt-4">
        <div className="container mx-auto px-3 sm:px-6 h-20 sm:h-28 flex items-center justify-between rounded-xl sm:rounded-2xl glass-strong">
          <motion.a 
            href="/" 
            className="flex items-center gap-2 sm:gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img
              src="/Fusion_Icon-No-BG-01.png"
              alt="Fusion Logo"
              className="h-16 sm:h-24 w-auto"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.a>

          <nav className="hidden md:flex items-center gap-1">
            {["How It Works", "Solutions", "Features"].map((item) => {
              const sectionId = item.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeSection === sectionId;
              return (
                <motion.a
                  key={item}
                  href={`#${sectionId}`}
                  className={getLinkClass(sectionId)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ originX: 0 }}
                  />
                </motion.a>
              );
            })}
          </nav>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" onClick={handleJoinWaitlist}>
              Join
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;