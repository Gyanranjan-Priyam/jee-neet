import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Trophy, Target, GraduationCap, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    const element = document.getElementById('batches');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchDemo = () => {
    // Placeholder for demo video modal
    console.log('Opening demo video...');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold">Top-Ranked JEE & NEET Preparation Platform</span>
          </div>

          <h1 className="font-poppins font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight">
            Crack <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">JEE & NEET</span>
            <br />with Expert Guidance
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Join thousands of successful students with our comprehensive live batches, 
            expert faculty, and proven teaching methodology.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-2xl text-lg font-bold px-8 py-4 h-auto"
              onClick={handleGetStarted}
            >
              View Live Batches
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 backdrop-blur-md text-lg font-semibold px-8 py-4 h-auto hover:bg-white/20"
              onClick={handleWatchDemo}
            >
              <Play className="mr-2 w-6 h-6" />
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="font-bold text-3xl mb-1">50K+</div>
              <div className="text-sm text-white/80">Active Students</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <div className="font-bold text-3xl mb-1">95%</div>
              <div className="text-sm text-white/80">Success Rate</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <div className="font-bold text-3xl mb-1">25+</div>
              <div className="text-sm text-white/80">Live Batches</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="font-bold text-3xl mb-1">100+</div>
              <div className="text-sm text-white/80">Expert Faculty</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
