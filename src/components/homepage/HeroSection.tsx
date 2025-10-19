"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Users, BookOpen, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    const element = document.getElementById("batches");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleWatchDemo = () => {
    console.log("Opening demo video...");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black border-b border-gray-200/50">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-24 text-center md:text-left md:flex md:items-center md:justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-7">
          <Button
            variant="outline"
            className="text-sm font-medium bg-white border-gray-200 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
          >
            #1 AI‑enabled JEE & NEET Prep Platform
          </Button>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-snug">
            Accelerate your medical and engineering journey with{" "}
            <span className="text-blue-600 dark:text-blue-400">
              adaptive learning tools
            </span>{" "}
            and expert faculty.
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
            Personalized live classes, smart progress tracking, and doubt-solving 
            with India’s top educators — built to help you master every concept.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md px-7 py-4 transition-all"
            >
              Explore Courses
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              onClick={handleWatchDemo}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800 text-lg px-7 py-4"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center md:text-left">
            <div>
              <div className="font-bold text-3xl text-gray-900 dark:text-white">
                50K+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active Learners
              </div>
            </div>
            <div>
              <div className="font-bold text-3xl text-gray-900 dark:text-white">
                98%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Exam Success Rate
              </div>
            </div>
            <div>
              <div className="font-bold text-3xl text-gray-900 dark:text-white">
                100+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Expert Educators
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Illustration */}
        <div className="hidden md:block flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-purple-100 to-transparent dark:from-blue-900/20 dark:via-purple-900/10 blur-2xl rounded-full" />
          <img
            src="https://blog.smartabroad.in/wp-content/uploads/2022/08/studying-student-on-desk.jpg"
            alt="Students learning online"
            className="relative z-10 rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
