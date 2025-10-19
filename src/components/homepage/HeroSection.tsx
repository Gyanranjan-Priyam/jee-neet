import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  instructor: string;
  imageUrl?: string;
  badge?: string;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  price: number;
  originalPrice?: number;
}

export function CoursesSection() {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Popular Courses
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Explore our most loved courses, designed by experts for your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group hover-elevate overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              data-testid={`course-card-${course.id}`}
            >
              <CardHeader className="p-0 relative">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-chart-2/20 overflow-hidden" data-testid={`course-image-${course.id}`}>
                  {course.imageUrl && (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  {course.badge && (
                    <Badge
                      className="absolute top-3 right-3 bg-primary text-primary-foreground font-semibold"
                      data-testid={`badge-${course.badge.toLowerCase()}-${course.id}`}
                    >
                      {course.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-poppins font-semibold text-lg text-foreground line-clamp-2 min-h-[56px]" data-testid={`course-title-${course.id}`}>
                  {course.title}
                </h3>
                <div className="text-sm text-muted-foreground" data-testid={`course-instructor-${course.id}`}>
                  by {course.instructor}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1" data-testid={`course-rating-${course.id}`}>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground" data-testid={`course-enrolled-${course.id}`}>
                    <Users className="w-4 h-4" />
                    <span>{course.studentsEnrolled.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground" data-testid={`course-duration-${course.id}`}>
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-2xl text-primary" data-testid={`course-price-${course.id}`}>
                    ₹{course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-muted-foreground line-through text-sm" data-testid={`course-original-price-${course.id}`}>
                      ₹{course.originalPrice}
                    </span>
                  )}
                </div>
                <Button size="sm" data-testid={`button-enroll-${course.id}`}>
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" data-testid="button-view-all-courses">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
}
