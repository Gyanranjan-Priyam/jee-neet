import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-poppins font-bold text-xl">
                JEE-NEET Prep
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering students to achieve their dreams through quality education and expert guidance.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="rounded-full border-gray-600 hover:bg-blue-600 hover:border-blue-600">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full border-gray-600 hover:bg-blue-400 hover:border-blue-400">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full border-gray-600 hover:bg-pink-600 hover:border-pink-600">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full border-gray-600 hover:bg-blue-700 hover:border-blue-700">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full border-gray-600 hover:bg-red-600 hover:border-red-600">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('batches')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Live Batches
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Success Stories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/admin/login')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Programs</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-400">JEE Main & Advanced</span>
              </li>
              <li>
                <span className="text-gray-400">NEET Preparation</span>
              </li>
              <li>
                <span className="text-gray-400">Foundation Courses</span>
              </li>
              <li>
                <span className="text-gray-400">Board Examinations</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <a href="mailto:info@jeeneetprep.com" className="text-gray-400 hover:text-white transition-colors">
                    info@jeeneetprep.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <a href="tel:+919876543210" className="text-gray-400 hover:text-white transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <span className="text-gray-400">
                    Delhi, Mumbai, Bangalore
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} JEE-NEET Prep. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
