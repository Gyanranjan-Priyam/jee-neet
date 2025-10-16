import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, CheckCircle, Heart } from "lucide-react";
interface Testimonial {
  id: string;
  studentName: string;
  examCleared: string;
  quote: string;
  rating: number;
  verified: boolean;
  videoUrl?: string;
  imageUrl?: string;
}

export function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 flex items-center justify-center gap-3">
            <span>Students</span>
            <Heart className="w-10 h-10 fill-red-500 text-red-500" />
            <span>EduLearn</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Hear from our students who achieved their dreams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="group hover-elevate overflow-hidden transition-all duration-300 hover:shadow-xl"
              data-testid={`testimonial-card-${testimonial.id}`}
            >
              <CardContent className="p-0">
                {testimonial.videoUrl && (
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-chart-2/20 overflow-hidden group cursor-pointer">
                    {testimonial.imageUrl && (
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.studentName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-chart-2/20 flex-shrink-0" data-testid={`testimonial-avatar-${testimonial.id}`}>
                      {testimonial.imageUrl && !testimonial.videoUrl && (
                        <img
                          src={testimonial.imageUrl}
                          alt={testimonial.studentName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate" data-testid={`testimonial-name-${testimonial.id}`}>
                          {testimonial.studentName}
                        </h4>
                        {testimonial.verified && (
                          <CheckCircle className="w-4 h-4 text-chart-3 flex-shrink-0" data-testid={`testimonial-verified-${testimonial.id}`} />
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs" data-testid={`testimonial-exam-${testimonial.id}`}>
                        {testimonial.examCleared}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-1" data-testid={`testimonial-rating-${testimonial.id}`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4" data-testid={`testimonial-quote-${testimonial.id}`}>
                    "{testimonial.quote}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
