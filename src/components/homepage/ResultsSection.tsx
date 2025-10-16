import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Medal, Award } from "lucide-react";
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

export function ResultsSection() {
  const [selectedExam, setSelectedExam] = useState("all");
  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
  });

  const examTypes = ["all", ...new Set(results.map((r) => r.examType))];
  const filteredResults =
    selectedExam === "all"
      ? results
      : results.filter((r) => r.examType === selectedExam);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30" id="results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse bg-muted rounded-lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background via-muted/30 to-background" id="results">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Academic Excellence</span>
          </div>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Our Students' Success Stories
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Giving wings to millions of dreams, a million more to go
          </p>
        </div>

        <Tabs value={selectedExam} onValueChange={setSelectedExam} className="mb-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full justify-start md:justify-center gap-2 bg-muted/50 p-2">
              {examTypes.map((exam) => (
                <TabsTrigger
                  key={exam}
                  value={exam}
                  className="capitalize whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-${exam}`}
                >
                  {exam === "all" ? "All Results" : exam}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.slice(0, 9).map((result, index) => {
            const isTopRank = result.rank && result.rank <= 3;
            return (
              <Card
                key={result.id}
                className={`group hover-elevate overflow-hidden transition-all duration-300 ${
                  isTopRank ? "border-2 border-primary shadow-lg" : ""
                }`}
                data-testid={`result-card-${result.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-chart-2/20" data-testid={`result-avatar-${result.id}`}>
                        {result.imageUrl && (
                          <img
                            src={result.imageUrl}
                            alt={result.studentName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {isTopRank && (
                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          {result.rank === 1 ? (
                            <Trophy className="w-4 h-4" />
                          ) : result.rank === 2 ? (
                            <Medal className="w-4 h-4" />
                          ) : (
                            <Award className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-poppins font-semibold text-lg text-foreground mb-1 truncate" data-testid={`result-name-${result.id}`}>
                        {result.studentName}
                      </h3>
                      <Badge variant="secondary" className="mb-2" data-testid={`result-exam-${result.id}`}>
                        {result.examType}
                      </Badge>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`result-achievement-${result.id}`}>
                        {result.achievement}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        {result.rank && (
                          <span className="font-semibold text-primary" data-testid={`result-rank-${result.id}`}>
                            Rank: {result.rank}
                          </span>
                        )}
                        {result.percentage && (
                          <span className="font-semibold text-chart-3" data-testid={`result-percentage-${result.id}`}>
                            {result.percentage}%
                          </span>
                        )}
                        <span className="text-muted-foreground" data-testid={`result-year-${result.id}`}>{result.year}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found for this category
          </div>
        )}
      </div>
    </section>
  );
}
