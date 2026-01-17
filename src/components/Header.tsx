import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleJoinClick = () => {
    setMobileMenuOpen(false);
    window.location.href = '/user';
  };

  const handleNavClick = (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
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
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 md:h-24 lg:h-28 flex items-center justify-between rounded-xl sm:rounded-2xl backdrop-blur-md bg-background/80 border border-border/50">
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
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
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
                  onClick={handleNavClick(sectionId)}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <motion.div className="hidden md:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" onClick={handleJoinClick}>
                Join
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mx-2 sm:mx-4 mt-2 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 rounded-xl backdrop-blur-md bg-background/95 border border-border/50">
              <nav className="flex flex-col gap-2">
                {["How It Works", "Solutions", "Features"].map((item) => {
                  const sectionId = item.toLowerCase().replace(/\s+/g, "-");
                  const isActive = activeSection === sectionId;
                  return (
                    <a
                      key={item}
                      href={`#${sectionId}`}
                      onClick={handleNavClick(sectionId)}
                      className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {item}
                    </a>
                  );
                })}
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="w-full mt-2" 
                  onClick={handleJoinClick}
                >
                  Join
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;