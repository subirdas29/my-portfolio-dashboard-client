"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Lightbulb, Loader2 } from "lucide-react";

export default function AIInsightsWidget() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/insights`
      );
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setInsights(data.data);
      } else {
        setError("Failed to parse insights.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-violet-200 dark:border-violet-800/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI Insights
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Powered by Gemini — analyzes your portfolio stats
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={generate}
            disabled={loading}
            className="h-8"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : insights.length > 0 ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">
              {loading ? "Generating..." : insights.length > 0 ? "Refresh" : "Generate"}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!loading && insights.length === 0 && !error && (
          <div className="text-center py-4 text-muted-foreground text-sm space-y-2">
            <Lightbulb className="h-8 w-8 mx-auto opacity-30" />
            <p>Click Generate to get AI-powered insights about your portfolio, traffic, and business.</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your portfolio data...
          </div>
        )}
        {insights.length > 0 && !loading && (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
