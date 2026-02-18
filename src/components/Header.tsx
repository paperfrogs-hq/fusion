import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems: Array<{ label: string; sectionId?: string; path?: string }> = [
    { label: "How It Works", sectionId: "how-it-works" },
    { label: "Solutions", sectionId: "solutions" },
    { label: "Features", sectionId: "features" },
    { label: "Pricing", path: "/pricing" },
  ];

  useEffect(() => {
    const sections = navItems
      .map((item) => item.sectionId)
      .filter((sectionId): sectionId is string => Boolean(sectionId));

    const handleScroll = () => {
      let currentSection = "";

      if (location.pathname === "/") {
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 180) {
              currentSection = sectionId;
            }
          }
        }
      }

      setActiveSection(currentSection);
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleNavClick =
    ({ sectionId, path }: { sectionId?: string; path?: string }) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (path) {
      navigate(path);
      return;
    }

    if (!sectionId) return;

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 104;
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const getLinkClass = (isActive: boolean) => {
    return `relative px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Container className="pt-4">
        <div
          className={`flex h-16 items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:h-[72px] sm:px-6 ${
            isScrolled
              ? "border-border bg-background/72 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <a href="/" className="flex items-center">
            <img
              src="/Logo-01-transparent.png"
              alt="Fusion"
              className="fusion-logo-lockup h-auto w-[150px] shrink-0"
            />
          </a>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const sectionId = item.sectionId ?? "";
              const isActive = item.path ? location.pathname === item.path : activeSection === sectionId;
              return (
                <a
                  key={item.label}
                  href={item.path ?? `#${sectionId}`}
                  onClick={handleNavClick(item)}
                  className={`group ${getLinkClass(isActive)}`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3 bottom-1 h-px bg-primary transition-transform duration-200 group-hover:scale-x-100 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate("/user/login")}>User</Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary/70 bg-primary/10 text-primary hover:border-[#C8FF2F] hover:bg-primary/15 hover:text-[#C8FF2F]"
              onClick={() => navigate("/client/login")}
            >
              <Building2 className="h-3.5 w-3.5" />
              Enterprise
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mt-2 md:hidden"
            >
              <div className="rounded-xl border border-border bg-card/95 p-4 backdrop-blur-xl">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const sectionId = item.sectionId ?? "";
                    const isActive = item.path ? location.pathname === item.path : activeSection === sectionId;
                    return (
                      <a
                        key={item.label}
                        href={item.path ?? `#${sectionId}`}
                        onClick={handleNavClick(item)}
                        className={`rounded-md px-3 py-2 text-sm ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/user/login");
                    }}
                  >
                    User
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-primary/70 bg-primary/10 text-primary hover:border-[#C8FF2F] hover:bg-primary/15 hover:text-[#C8FF2F]"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/client/login");
                    }}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    Enterprise
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
};

export default Header;
