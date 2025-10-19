"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, Star, BookOpen, Video, Award, CheckCircle2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Batch {
  id: string;
  name: string;
  description: string;
  category: string;
  class_type: string;
  thumbnail: string;
  capacity: number;
  fees: number;
  schedule_days: string[];
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  teacher_name: string;
  teacher_subject: string;
  teacher_experience: string;
  teacher_qualification: string;
  teacher_bio: string;
  status: string;
  created_at: string;
}

export function BatchesSection() {
  const router = useRouter();
  const { data: batchesData, isLoading, error } = useQuery({
    queryKey: ["/api/batches"],
    queryFn: async () => {
      const response = await fetch("/api/batches?status=active");
      if (!response.ok) throw new Error("Failed to fetch batches");
      return response.json();
    },
  });

  const batches: Batch[] = batchesData?.batches || [];

  const handleViewBatch = (batchId: string) => {
    router.push(`/student/batches/view/${batchId}`);
  };

  const handleEnrollNow = (batchId: string) => {
    router.push(`/student/login?redirect=/student/batches/view/${batchId}`);
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      JEE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      NEET: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      Foundation: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
      Boards: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      UPSC: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    };
    return styles[category as keyof typeof styles] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  const formatSchedule = (days: string[], startTime: string, endTime: string) => {
    if (!days || days.length === 0) return "Schedule TBA";
    const daysStr = days.join(", ");
    const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : "";
    return `${daysStr} ${timeStr}`.trim();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" id="batches">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !batches.length) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" id="batches">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Active Batches</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Check back soon for upcoming courses.</p>
          <Button onClick={() => router.push("/admin/login")} variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Admin Login
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-950" id="batches">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm font-medium px-3 py-1 border-gray-300 dark:border-gray-700 dark:text-gray-300">
            Live Classes Available
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Explore Our Live Batches
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto">
            Instructor-led courses with interactive sessions, doubt clearing, and personalized mentorship
          </p>
        </div>

        {/* Batch Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card
              key={batch.id}
              className="group hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              {/* Thumbnail */}
              <CardHeader className="p-0 relative">
                <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {batch.thumbnail ? (
                    <img
                      src={batch.thumbnail}
                      alt={batch.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <Video className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 left-3 text-xs font-medium border ${getCategoryBadge(
                      batch.category
                    )}`}
                  >
                    {batch.category}
                  </Badge>
                  {batch.status === "active" && (
                    <Badge className="absolute top-3 right-3 bg-green-500 dark:bg-green-600 text-white text-xs border-0">
                      Enrolling Now
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Course Title */}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                  {batch.name}
                </h3>

                {/* Instructor Info */}
                {batch.teacher_name && (
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center text-xs">
                      {batch.teacher_name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {batch.teacher_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {batch.teacher_subject} • {batch.teacher_experience}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">4.8</span>
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs leading-relaxed">
                      {formatSchedule(batch.schedule_days, batch.start_time, batch.end_time)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs">
                      {batch.start_date && batch.end_date
                        ? `${new Date(batch.start_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })} - ${new Date(batch.end_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : "Flexible Duration"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs">
                      Limited to {batch.capacity || 30} students per batch
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                    <span>Live interactive classes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                    <span>Recorded lectures & study material</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                    <span>Weekly tests & performance tracking</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      ₹{batch.fees?.toLocaleString("en-IN") || "—"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Per student</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBatch(batch.id)}
                      className="text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEnrollNow(batch.id)}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs"
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/student/login")}
            className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          >
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
}
