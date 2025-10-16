import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogin = () => {
    router.push('/student/login');
  };

  const handleRegister = () => {
    router.push('/student/register');
  };

  const handleAdminDashboard = () => {
    router.push('/admin/dashboard');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-poppins font-bold text-xl md:text-2xl text-gray-900">
              JEE-NEET Prep
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('batches')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Live Batches
            </button>
            <button
              onClick={() => scrollToSection('results')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Results
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Reviews
            </button>
            <button
              onClick={handleAdminDashboard}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleLogin}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              Student Login
            </Button>
            <Button 
              onClick={handleRegister}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Join Now
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('batches')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 text-left"
              >
                Live Batches
              </button>
              <button
                onClick={() => scrollToSection('results')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 text-left"
              >
                Results
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 text-left"
              >
                Reviews
              </button>
              <button
                onClick={handleAdminDashboard}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-2 text-left"
              >
                Dashboard
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={handleLogin}
                >
                  Student Login
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                  onClick={handleRegister}
                >
                  Join Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
