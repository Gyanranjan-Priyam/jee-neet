import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, Star, BookOpen, Video, Award, User } from "lucide-react";
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
    queryKey: ['/api/batches'],
    queryFn: async () => {
      const response = await fetch('/api/batches?status=active');
      if (!response.ok) throw new Error('Failed to fetch batches');
      return response.json();
    },
  });

  const batches: Batch[] = batchesData?.batches || [];

  const handleViewBatch = (batchId: string) => {
    router.push(`/admin/batches/view/${batchId}`);
  };

  const handleEnrollNow = (batchId: string) => {
    // Redirect to enrollment or login page
    router.push(`/admin/login?redirect=/admin/batches/view/${batchId}`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'JEE': 'bg-blue-500',
      'NEET': 'bg-green-500',
      'Foundation': 'bg-purple-500',
      'Boards': 'bg-orange-500',
      'UPSC': 'bg-red-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const formatSchedule = (days: string[], startTime: string, endTime: string) => {
    if (!days || days.length === 0) return 'Schedule TBA';
    const daysStr = days.join(', ');
    const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : '';
    return `${daysStr} ${timeStr}`.trim();
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="batches">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !batches.length) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="batches">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-poppins font-bold text-4xl text-gray-900 mb-4">
            Live Batches
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            No active batches available at the moment. Please check back later.
          </p>
          <Button 
            onClick={() => router.push('/admin/login')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Admin Login
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="batches">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Live Learning</span>
          </div>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Choose Your Perfect Batch
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Join our expert-led live batches designed for JEE, NEET, and competitive exam success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map((batch) => (
            <Card 
              key={batch.id} 
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden"
            >
              <CardHeader className="p-0 relative">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  {batch.thumbnail ? (
                    <img
                      src={batch.thumbnail}
                      alt={batch.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Badge 
                    className={`absolute top-4 left-4 ${getCategoryColor(batch.category)} text-white font-semibold`}
                  >
                    {batch.category}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white font-semibold">
                    {batch.status.toUpperCase()}
                  </Badge>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg line-clamp-2">{batch.name}</h3>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                {batch.teacher_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                      {batch.teacher_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{batch.teacher_name}</div>
                      <div className="text-xs text-gray-500">
                        {batch.teacher_subject} • {batch.teacher_experience}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>
                )}

                <p className="text-gray-600 text-sm line-clamp-2">
                  {batch.description || 'Comprehensive preparation with expert guidance and study materials.'}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatSchedule(batch.schedule_days, batch.start_time, batch.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {batch.start_date && batch.end_date ? 
                      `${new Date(batch.start_date).toLocaleDateString()} - ${new Date(batch.end_date).toLocaleDateString()}` : 'Flexible'
                    }</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Batch Size: {batch.capacity || 'Limited'} students</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{batch.fees?.toLocaleString() || 'Contact'}
                    </div>
                    <div className="text-xs text-gray-500">One-time payment</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewBatch(batch.id)}
                      className="hover:bg-primary hover:text-white"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleEnrollNow(batch.id)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => router.push('/admin/login')}
            className="hover:bg-primary hover:text-white"
          >
            View All Batches
          </Button>
        </div>
      </div>
    </section>
  );
}