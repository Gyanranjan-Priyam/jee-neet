'use client'

import { Navigation } from "@/components/homepage/Navigation";
import { HeroSection } from "@/components/homepage/HeroSection";
import { BatchesSection } from "@/components/homepage/BatchesSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";
import { Footer } from "@/components/homepage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <BatchesSection />
      <FeaturesSection />
      <SuccessStoriesSection />
      <Footer />
    </div>
  );
}
