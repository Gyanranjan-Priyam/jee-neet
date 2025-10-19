"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  BookOpen,
  Users,
  Award,
  Clock,
  Target,
  MessageCircle,
  Download,
  BarChart3,
  Brain,
  Trophy,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live Interactive Classes",
    description: "HD video sessions with screen sharing, digital whiteboard, and real-time Q&A",
    category: "Learning",
  },
  {
    icon: Brain,
    title: "AI-Powered Personalization",
    description: "Adaptive learning paths based on your performance and weak areas",
    category: "Technology",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Study Material",
    description: "NCERT-aligned notes, formula sheets, video solutions, and previous year papers",
    category: "Content",
  },
  {
    icon: Target,
    title: "Regular Mock Tests",
    description: "JEE/NEET pattern tests with detailed solutions and performance analysis",
    category: "Assessment",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Chapter-wise tracking, strength-weakness report, and improvement roadmap",
    category: "Analytics",
  },
  {
    icon: MessageCircle,
    title: "Instant Doubt Resolution",
    description: "Ask questions anytime via chat, voice, or upload images for quick solutions",
    category: "Support",
  },
  {
    icon: Users,
    title: "Small Batch Size",
    description: "Maximum 30 students per batch ensuring personalized attention from faculty",
    category: "Learning",
  },
  {
    icon: Award,
    title: "Expert Faculty",
    description: "IIT/AIIMS alumni and educators with 10+ years of JEE/NEET coaching experience",
    category: "Faculty",
  },
  {
    icon: Download,
    title: "Offline Access",
    description: "Download lectures, notes, and DPPs for learning without internet connectivity",
    category: "Accessibility",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Morning, evening, and weekend batches with class recordings available 24/7",
    category: "Convenience",
  },
  {
    icon: Trophy,
    title: "Scholarship Programs",
    description: "Merit-based scholarships up to 100% for top performers in entrance tests",
    category: "Benefits",
  },
  {
    icon: Clock,
    title: "Revision Sessions",
    description: "Weekly revision classes, crash courses, and last-minute preparation modules",
    category: "Support",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm font-medium px-3 py-1 border-gray-300 dark:border-gray-700 dark:text-gray-300">
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto">
            Comprehensive learning tools and support systems designed specifically for JEE & NEET aspirants
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <CardContent className="p-5 space-y-3">
                  {/* Icon & Category */}
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0"
                    >
                      {feature.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ready to start your success journey?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Join thousands of students who are preparing smarter with our platform
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">No hidden charges</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">7-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Free demo class</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
