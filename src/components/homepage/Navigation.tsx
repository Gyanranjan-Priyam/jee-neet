"use client";
import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Live Batches", section: "batches" },
    { name: "Results", section: "results" },
    { name: "Reviews", section: "testimonials" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 px-5 transition-colors duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b shadow-sm dark:bg-gray-800/80"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-2xl text-gray-900 group-hover:text-blue-600 transition-colors dark:text-white">
            JEE-NEET Prep
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <div
              key={link.name}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <button
                onClick={() => scrollToSection(link.section)}
                className="relative font-medium text-gray-700 dark:text-white hover:text-blue-600 transition-colors px-2 py-1"
              >
                {link.name}
                <AnimatePresence>
                  {hoveredLink === link.name && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 w-full rounded-full"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            </div>
          ))}
          <button
            onClick={() => router.push("/student/dashboard")}
            className="font-medium text-gray-700 hover:text-blue-600 transition-colors dark:text-white"
          >
            Dashboard
          </button>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/student/login")}
            className="hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            Student Login
          </Button>
          <Button
            onClick={() => router.push("/student/register")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            Join Now
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-sm"
          >
            <div className="flex flex-col items-start p-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.section)}
                  className="text-gray-700 hover:text-blue-600 text-left transition-all font-medium"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="text-gray-700 hover:text-blue-600 transition-all font-medium"
              >
                Dashboard
              </button>
              <div className="flex flex-col w-full gap-2 pt-3">
                <Button
                  variant="ghost"
                  className="w-full hover:text-blue-600"
                  onClick={() => router.push("/student/login")}
                >
                  Student Login
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                  onClick={() => router.push("/student/register")}
                >
                  Join Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
