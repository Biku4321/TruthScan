import { Medal, Shield, Zap, Target, Crown, Search } from "lucide-react"; // <--- Imported Search here

export const LEVELS = [
  { level: 1, name: "Rookie", minScore: 0 },
  { level: 2, name: "Fact Checker", minScore: 100 },
  { level: 3, name: "Investigator", minScore: 300 },
  { level: 4, name: "Truth Sentinel", minScore: 600 },
  { level: 5, name: "Grandmaster", minScore: 1000 },
];

export const BADGES = [
  {
    id: "first_scan",
    name: "First Contact",
    description: "Completed your first verification scan.",
    icon: Zap,
    condition: (stats: any) => stats.totalScans >= 1,
    color: "text-yellow-500 bg-yellow-100",
  },
  {
    id: "detective",
    name: "Detective",
    description: "Detected 10+ Deepfakes successfully.",
    icon: Search, // <--- Used the imported component directly
    condition: (stats: any) => stats.fakesDetected >= 10,
    color: "text-blue-500 bg-blue-100",
  },
  {
    id: "veteran",
    name: "Veteran Agent",
    description: "Performed over 50 total scans.",
    icon: Shield,
    condition: (stats: any) => stats.totalScans >= 50,
    color: "text-purple-500 bg-purple-100",
  },
  {
    id: "sniper",
    name: "Truth Sniper",
    description: "Accumulated 500+ Truth Points.",
    icon: Target,
    condition: (stats: any) => stats.truthScore >= 500,
    color: "text-red-500 bg-red-100",
  },
];

export function calculateLevel(score: number) {
  // Find the highest level where minScore <= current score
  const level = LEVELS.slice().reverse().find(l => score >= l.minScore) || LEVELS[0];
  
  // Calculate progress to next level
  const currentLevelIndex = LEVELS.findIndex(l => l.level === level.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];
  
  let progress = 100;
  if (nextLevel) {
    const range = nextLevel.minScore - level.minScore;
    const gained = score - level.minScore;
    progress = Math.floor((gained / range) * 100);
  }

  return { current: level, next: nextLevel, progress };
}