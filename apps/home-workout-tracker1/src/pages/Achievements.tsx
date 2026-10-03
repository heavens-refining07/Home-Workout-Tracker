import { useState, useEffect } from 'react';
import { getAchievements, getDashboard } from 'zitejs/api';
import { Trophy, Lock, Flame, Zap } from 'lucide-react';
import { Card } from '@project/components/ui/card';

const allAchievements = [
  { key: 'first_workout', name: 'First Workout', desc: 'Complete your first workout', icon: '🎯' },
  { key: '7_day_streak', name: '7-Day Streak', desc: 'Work out 7 days in a row', icon: '🔥' },
  { key: '10_workouts', name: '10 Workouts', desc: 'Complete 10 workouts', icon: '💪' },
  { key: '50_workouts', name: '50 Workouts', desc: 'Complete 50 workouts', icon: '🔥' },
  { key: '100_workouts', name: '100 Workouts', desc: 'Complete 100 workouts', icon: '🏆' },
  { key: '1000_calories', name: '1,000 Calories', desc: 'Burn 1,000 total calories', icon: '🔥' },
  { key: 'consistency', name: 'Consistency Champion', desc: 'Work out 4+ days per week for a month', icon: '⭐' },
  { key: 'personal_best', name: 'Personal Best', desc: 'Beat your previous workout record', icon: '🥇' },
];

export default function Achievements() {
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAchievements({}),
      getDashboard({}),
    ]).then(([ach, dash]) => {
      setUnlocked(ach.achievements);
      setDashData(dash.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const unlockedKeys = new Set(unlocked.map(a => a.achievementKey));

  if (loading) return <div className="p-4 lg:p-6 max-w-3xl mx-auto"><div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Streaks & Achievements</h1>

      {/* Streak Stats */}
      {dashData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card border-border p-4 text-center">
            <Flame className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{dashData.streak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{dashData.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Total Workouts</p>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{unlocked.length}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </Card>
          <Card className="bg-card border-border p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{dashData.weeklyWorkouts}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </Card>
        </div>
      )}

      <h2 className="font-semibold text-lg">Badges</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {allAchievements.map(a => {
          const isUnlocked = unlockedKeys.has(a.key);
          const record = unlocked.find(u => u.achievementKey === a.key);
          return (
            <Card key={a.key} className={`border p-4 flex items-center gap-3 transition-colors ${isUnlocked ? 'bg-card border-primary/30 glow-accent-sm' : 'bg-card/50 border-border opacity-60'}`}>
              <div className="text-3xl">{isUnlocked ? a.icon : '🔒'}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${isUnlocked ? '' : 'text-muted-foreground'}`}>{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
                {isUnlocked && record?.unlockedDate && <p className="text-xs text-primary mt-0.5">Unlocked: {record.unlockedDate}</p>}
              </div>
              {isUnlocked ? <Trophy className="w-5 h-5 text-primary shrink-0" /> : <Lock className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
