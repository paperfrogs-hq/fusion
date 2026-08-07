import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Container } from "@/components/ui/container";

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const onHome = location.pathname === "/";
  const onAPC = location.pathname === "/apc";

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-rule transition-opacity duration-300 ${
          scrolled || menuOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container wide>
        <div className="relative flex h-16 items-center justify-between sm:h-[72px]">
          <Link
            to="/"
            aria-label="Fusion, home"
            className="group flex items-baseline gap-2.5"
          >
            <span className="font-serif text-[22px] italic leading-none text-foreground">
              Fusion
            </span>
            <span className="hidden font-serif text-[11px] italic leading-none text-muted-foreground/70 sm:inline">
              {onHome ? "trust for AI audio" : "by Paperfrogs"}
            </span>
          </Link>

          <div className="flex items-center gap-7 sm:gap-9">
            <Link
              to="/apc"
              className="group relative hidden items-baseline gap-1.5 md:inline-flex"
            >
              <span
                aria-hidden="true"
                className={`block h-px w-3 origin-left transition-transform duration-300 ${
                  onAPC
                    ? "scale-x-100 bg-primary"
                    : "scale-x-0 bg-foreground/40 group-hover:scale-x-100"
                }`}
              />
              <span
                className={`relative text-sm transition-colors duration-200 ${
                  onAPC ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                APC
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left bg-foreground/70 transition-transform duration-300 ${
                    onAPC ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </span>
            </Link>

            <Link
              to="/waitlist"
              className="group hidden font-serif text-sm italic text-foreground sm:inline-flex"
            >
              <span className="link-underline">Join the waitlist</span>
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="-mr-2 inline-flex h-9 items-center gap-2 px-2 font-serif text-sm italic text-muted-foreground transition-colors hover:text-foreground md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="text-[11px] not-italic uppercase tracking-[0.22em]">
                {menuOpen ? "Close" : "Menu"}
              </span>
              <span aria-hidden="true" className="relative inline-block h-3 w-4">
                <span
                  className={`absolute left-0 top-1 block h-px w-4 bg-current transition-transform duration-300 ${
                    menuOpen ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 block h-px w-4 bg-current transition-opacity duration-200 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="md:hidden"
          >
            <div className="border-t border-rule bg-background/95 backdrop-blur-xl">
              <Container wide>
                <nav className="flex flex-col py-7">
                  <Link
                    to="/apc"
                    className="group flex items-baseline justify-between border-b border-rule py-5"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        01
                      </span>
                      <span
                        className={`font-serif text-2xl italic leading-none ${
                          onAPC ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                        }`}
                      >
                        APC
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-serif text-base text-muted-foreground transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>

                  <div className="mt-7 flex items-center justify-between">
                    <Link
                      to="/waitlist"
                      className="group font-serif text-lg italic text-foreground"
                    >
                      <span className="link-underline">Join the waitlist</span>
                      <span
                        aria-hidden="true"
                        className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                    <span className="font-serif text-[11px] italic text-muted-foreground/70">
                      by Paperfrogs
                    </span>
                  </div>
                </nav>
              </Container>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;