import { Card, CardContent } from "@/components/ui/card";
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
  Shield
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live Interactive Classes",
    description: "Real-time learning with expert faculty and doubt-solving sessions",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: BookOpen,
    title: "Comprehensive Study Material",
    description: "Complete notes, assignments, and practice papers for all subjects",
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: Users,
    title: "Small Batch Size",
    description: "Limited students per batch for personalized attention and guidance",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Award,
    title: "Expert Faculty",
    description: "Learn from IIT/NIT alumni and experienced subject matter experts",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "Multiple batch timings to fit your schedule and convenience",
    color: "text-red-500",
    bgColor: "bg-red-50"
  },
  {
    icon: Target,
    title: "Regular Assessments",
    description: "Weekly tests and mock exams to track your progress effectively",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    icon: MessageCircle,
    title: "24/7 Doubt Support",
    description: "Get your doubts resolved anytime through our dedicated support",
    color: "text-pink-500",
    bgColor: "bg-pink-50"
  },
  {
    icon: Download,
    title: "Offline Access",
    description: "Download lectures and study materials for offline learning",
    color: "text-teal-500",
    bgColor: "bg-teal-50"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Detailed analysis of your performance with improvement suggestions",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50"
  },
  {
    icon: Shield,
    title: "Proven Results",
    description: "Track record of 95%+ success rate in JEE and NEET examinations",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Why Choose Our Platform?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Experience the best-in-class features designed to accelerate your exam preparation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}