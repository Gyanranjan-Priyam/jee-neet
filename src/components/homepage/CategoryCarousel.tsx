'use client'

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
// Define CourseCategory type locally until shared schema is available
type CourseCategory = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
};

export function CategoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: categories = [], isLoading } = useQuery<CourseCategory[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (categories.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [categories.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="min-w-full px-2"
                  data-testid={`category-slide-${category.id}`}
                >
                  <Card className="relative overflow-hidden rounded-xl h-64 md:h-80 hover-elevate cursor-pointer group">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary/90 to-chart-4/90"
                      style={{
                        backgroundImage: category.imageUrl ? `url(${category.imageUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>
                    <div className="relative h-full flex flex-col justify-end p-6 md:p-8 text-white">
                      <h3 className="font-poppins font-bold text-3xl md:text-4xl mb-2" data-testid={`category-name-${category.id}`}>
                        {category.name}
                      </h3>
                      <p className="text-white/90 text-lg mb-4" data-testid={`category-description-${category.id}`}>{category.description}</p>
                      <Button
                        variant="outline"
                        className="bg-white/20 border-white/40 text-white backdrop-blur-sm w-fit"
                        data-testid={`button-explore-${category.slug}`}
                      >
                        Explore Now
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {categories.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                onClick={goToPrevious}
                data-testid="button-carousel-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                onClick={goToNext}
                data-testid="button-carousel-next"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="flex justify-center gap-2 mt-6">
                {categories.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    data-testid={`carousel-dot-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
