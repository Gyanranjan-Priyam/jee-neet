'use client'

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Smartphone } from "lucide-react";

interface AppFeature {
  id: string;
  title: string;
  description: string;
}

export function AppDownloadSection() {
  const { data: features = [] } = useQuery<AppFeature[]>({
    queryKey: ["/api/app-features"],
  });

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-chart-2 to-chart-4 relative overflow-hidden" id="app">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Available on Mobile</span>
            </div>

            <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl">
              Join 15 Million Students on the App Today!
            </h2>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3" data-testid={`feature-${feature.id}`}>
                  <CheckCircle className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-lg mb-1">{feature.title}</div>
                    <div className="text-white/80">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-white text-primary border-white shadow-xl text-base font-semibold"
                data-testid="button-google-play"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35z"/>
                  <path d="M16.81 15.12l-3.12-3.12 3.12-3.12 3.96 2.28c.48.28.48 1.04 0 1.32l-3.96 2.28z"/>
                  <path d="M13.69 12L3.84 2.15c.24-.12.51-.15.77-.06L18.77 10 13.69 12z"/>
                  <path d="M13.69 12l5.08 2L4.61 21.91c-.26.09-.53.06-.77-.06L13.69 12z"/>
                </svg>
                Google Play
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 backdrop-blur-sm text-base font-semibold"
                data-testid="button-app-store"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                App Store
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full bg-white/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="w-72 h-[500px] bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center space-y-4 text-gray-800 p-8">
                    <Smartphone className="w-24 h-24 mx-auto text-primary" />
                    <div className="font-poppins font-bold text-2xl">
                      Download Now
                    </div>
                    <div className="text-muted-foreground">
                      Available on iOS & Android
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
