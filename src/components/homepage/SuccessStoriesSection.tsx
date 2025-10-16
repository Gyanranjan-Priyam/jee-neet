import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star } from "lucide-react";

interface Result {
  id: string;
  studentName: string;
  examType: string;
  achievement: string;
  rank?: number;
  percentage?: number;
  year: number;
  imageUrl?: string;
}

export function SuccessStoriesSection() {
  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50" id="results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const topResults = results.slice(0, 8);

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50" id="results">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 mb-6">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Success Stories</span>
          </div>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Our Students' Achievements
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Celebrating the success of our students who cracked JEE and NEET with flying colors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topResults.map((result, index) => {
            const isTopRank = result.rank && result.rank <= 10;
            const getRankIcon = () => {
              if (result.rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
              if (result.rank && result.rank <= 3) return <Medal className="w-5 h-5 text-orange-500" />;
              if (result.rank && result.rank <= 10) return <Award className="w-5 h-5 text-purple-500" />;
              return <Star className="w-5 h-5 text-blue-500" />;
            };

            return (
              <Card
                key={result.id}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  isTopRank ? "border-2 border-yellow-400 shadow-lg" : "shadow-md"
                } bg-white`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {result.studentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    {isTopRank && (
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                        {getRankIcon()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-poppins font-bold text-lg text-gray-900">
                      {result.studentName}
                    </h3>
                    <Badge 
                      className={`${
                        result.examType === 'JEE Advanced' || result.examType === 'JEE Main' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {result.examType}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {result.rank && (
                      <div className="text-2xl font-bold text-primary">
                        Rank {result.rank}
                      </div>
                    )}
                    {result.percentage && (
                      <div className="text-lg font-semibold text-green-600">
                        {result.percentage}%
                      </div>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.achievement}
                    </p>
                    <div className="text-xs text-gray-500">{result.year}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {results.length > 8 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg">
              <span className="font-bold text-2xl text-primary">{results.length}+</span> successful students and counting...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}