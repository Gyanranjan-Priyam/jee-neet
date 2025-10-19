import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, Clock, MapPin } from "lucide-react";

interface Statistic {
  id: string;
  icon: string;
  value: string;
  label: string;
  description: string;
}

const iconMap: Record<string, any> = {
  BookOpen,
  Users,
  Clock,
  MapPin,
};

export function StatisticsSection() {
  const { data: statistics = [], isLoading } = useQuery<Statistic[]>({
    queryKey: ["/api/statistics"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Learn with Love, Grow with Guidance
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Join millions of students on their journey to excellence
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statistics.map((stat, index) => {
            const Icon = iconMap[stat.icon] || BookOpen;
            return (
              <div
                key={stat.id}
                className="group hover-elevate active-elevate-2 rounded-xl p-6 md:p-8 bg-card border border-card-border text-center transition-all duration-300"
                data-testid={`stat-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="font-poppins font-bold text-4xl md:text-5xl text-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-semibold text-foreground text-lg mb-1">
                  {stat.label}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
