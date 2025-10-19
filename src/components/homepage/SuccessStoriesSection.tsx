"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star, TrendingUp, CheckCircle } from "lucide-react";

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

// Mock Success Stories Data
const MOCK_SUCCESS_STORIES: Result[] = [
  {
    id: "1",
    studentName: "Arjun Sharma",
    examType: "JEE Advanced",
    achievement: "Secured admission to IIT Bombay Computer Science",
    rank: 1,
    percentage: 98.5,
    year: 2024,
  },
  {
    id: "2",
    studentName: "Priya Patel",
    examType: "NEET",
    achievement: "Admitted to AIIMS Delhi for MBBS",
    rank: 2,
    percentage: 99.2,
    year: 2024,
  },
  {
    id: "3",
    studentName: "Rahul Verma",
    examType: "JEE Main",
    achievement: "Top scorer in state board with NIT admission",
    rank: 5,
    percentage: 97.8,
    year: 2024,
  },
  {
    id: "4",
    studentName: "Ananya Singh",
    examType: "NEET",
    achievement: "Selected for Government Medical College",
    rank: 15,
    percentage: 96.5,
    year: 2023,
  },
  {
    id: "5",
    studentName: "Karthik Reddy",
    examType: "JEE Advanced",
    achievement: "IIT Delhi Electrical Engineering admission",
    rank: 8,
    percentage: 98.1,
    year: 2024,
  },
  {
    id: "6",
    studentName: "Sneha Gupta",
    examType: "NEET",
    achievement: "JIPMER Puducherry MBBS seat secured",
    rank: 45,
    percentage: 95.8,
    year: 2023,
  },
  {
    id: "7",
    studentName: "Vikram Kumar",
    examType: "JEE Main",
    achievement: "NIT Trichy Mechanical Engineering",
    rank: 78,
    percentage: 94.2,
    year: 2024,
  },
  {
    id: "8",
    studentName: "Divya Nair",
    examType: "NEET",
    achievement: "Armed Forces Medical College selection",
    rank: 92,
    percentage: 93.7,
    year: 2023,
  },
  {
    id: "9",
    studentName: "Aditya Joshi",
    examType: "JEE Advanced",
    achievement: "IIT Kanpur Chemical Engineering",
    rank: 3,
    percentage: 98.9,
    year: 2024,
  },
  {
    id: "10",
    studentName: "Meera Iyer",
    examType: "NEET",
    achievement: "Maulana Azad Medical College Delhi",
    rank: 67,
    percentage: 94.9,
    year: 2023,
  },
];

export function SuccessStoriesSection() {
  const { data: results = MOCK_SUCCESS_STORIES, isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900" id="results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const topResults = results.slice(0, 8);

  // Calculate statistics
  const topRankers = results.filter((r) => r.rank && r.rank <= 100).length;
  const avgPercentage = results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length || 0;

  return (
    <section className="py-16 bg-white dark:bg-gray-950" id="results">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm font-medium px-3 py-1 border-gray-300 dark:border-gray-700 dark:text-gray-300">
            <Trophy className="w-3.5 h-3.5 mr-1.5 inline" />
            Hall of Excellence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Our Students' Success Stories
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto">
            Real results from dedicated learners who achieved their academic goals through our platform
          </p>
        </div>

        {/* Infinite Marquee Animation */}
        <div className="mb-16 relative overflow-hidden py-8 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-lg">
          <div className="flex w-max animate-marquee">
            {/* First Set */}
            {results.map((result) => (
              <div
                key={result.id}
                className="mx-4 inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 flex-shrink-0"
              >
                <div className="flex-shrink-0">
                  {result.rank && result.rank <= 3 ? (
                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <Star className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {result.studentName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {result.rank ? `AIR ${result.rank}` : `${result.percentage}%`} • {result.examType}
                  </p>
                </div>
              </div>
            ))}

            {/* Duplicate Set for Seamless Loop */}
            {results.map((result) => (
              <div
                key={`${result.id}-duplicate`}
                className="mx-4 inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 flex-shrink-0"
                aria-hidden="true"
              >
                <div className="flex-shrink-0">
                  {result.rank && result.rank <= 3 ? (
                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <Star className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {result.studentName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {result.rank ? `AIR ${result.rank}` : `${result.percentage}%`} • {result.examType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {results.length}+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Success Stories
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {topRankers}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Top 100 Ranks
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {avgPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Avg. Score
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {topResults.map((result) => {
            const isTopRank = result.rank && result.rank <= 10;
            const getRankBadge = () => {
              if (result.rank === 1) return { icon: Trophy, color: "text-yellow-600 dark:text-yellow-500" };
              if (result.rank && result.rank <= 3) return { icon: Medal, color: "text-orange-600 dark:text-orange-500" };
              if (result.rank && result.rank <= 10) return { icon: Award, color: "text-purple-600 dark:text-purple-500" };
              return { icon: Star, color: "text-blue-600 dark:text-blue-500" };
            };

            const rankBadge = getRankBadge();
            const RankIcon = rankBadge.icon;

            return (
              <Card
                key={result.id}
                className={`group hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 ${
                  isTopRank
                    ? "border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950/20 dark:to-gray-900"
                    : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                }`}
              >
                <CardContent className="p-5 text-center space-y-3.5">
                  {/* Avatar */}
                  <div className="relative inline-block">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {result.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    {isTopRank && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-md">
                        <RankIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                      {result.studentName}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${
                        result.examType.includes("JEE")
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                      }`}
                    >
                      {result.examType}
                    </Badge>
                  </div>

                  {/* Achievement Details */}
                  <div className="space-y-1.5 py-2 border-t border-gray-100 dark:border-gray-800">
                    {result.rank && (
                      <div className="flex items-center justify-center gap-1.5">
                        <RankIcon className={`w-4 h-4 ${rankBadge.color}`} />
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          AIR {result.rank}
                        </span>
                      </div>
                    )}
                    {result.percentage && (
                      <div className="flex items-center justify-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                        <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                          {result.percentage}% Score
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Achievement Text */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {result.achievement}
                  </p>

                  {/* Year Badge */}
                  <div className="pt-2">
                    <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Class of {result.year}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {results.length > 8 && (
          <div className="text-center mt-10 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Join <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{results.length}+</span> successful students who achieved their dream ranks
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
