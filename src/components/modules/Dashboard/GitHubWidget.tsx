"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, GitCommit, Star, Users, BookOpen } from "lucide-react";

type GitHubStats = {
  public_repos: number;
  followers: number;
  following: number;
  name: string;
};

type GitHubEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
};

export default function GitHubWidget() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchGitHub = async () => {
      // Fetch username from settings
      let ghUsername = "subirdev";
      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/settings`);
        const settingsData = await settingsRes.json();
        const ghUrl: string = settingsData?.data?.githubUrl ?? "";
        if (ghUrl) {
          const match = ghUrl.match(/github\.com\/([^/]+)/);
          if (match?.[1]) ghUsername = match[1];
        }
      } catch {}
      setUsername(ghUsername);

      try {
        const [userRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${ghUsername}`, { cache: "no-store" }),
          fetch(`https://api.github.com/users/${ghUsername}/events/public?per_page=10`),
        ]);
        const user = await userRes.json();
        const evs = await eventsRes.json();
        setStats(user);
        setEvents(Array.isArray(evs) ? evs.filter((e: GitHubEvent) => e.type === "PushEvent").slice(0, 5) : []);
      } catch {
        // GitHub rate limit or network issue
      } finally {
        setLoading(false);
      }
    };
    fetchGitHub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4 text-sm text-muted-foreground">Loading GitHub...</CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Github className="h-4 w-4 text-muted-foreground" />
          GitHub Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <BookOpen className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{stats.public_repos}</p>
            <p className="text-[10px] text-muted-foreground">Repos</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Users className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{stats.followers}</p>
            <p className="text-[10px] text-muted-foreground">Followers</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Star className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{stats.following}</p>
            <p className="text-[10px] text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Recent commits */}
        {events.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Recent Pushes</p>
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <GitCommit className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate text-muted-foreground flex-1">{ev.repo.name.split("/")[1]}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(ev.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-3 w-3" />
          @{username}
        </a>
      </CardContent>
    </Card>
  );
}
