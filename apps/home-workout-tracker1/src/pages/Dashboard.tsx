import { useEffect, useState } from 'react';
import { getDashboard } from 'zitejs/api';
import { useAuth } from 'zitejs/auth';
import { Activity, Flame, Dumbbell, Zap, Scale, Timer, Target, Trophy } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard({}).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashSkeleton />;
  if (!data) return <div className="p-6 text-muted-foreground">Failed to load dashboard</div>;

  const stats = [
    { icon: Scale, label: 'BMI', value: data.bmi ? data.bmi.toFixed(1) : '—', color: 'text-primary' },
    { icon: Flame, label: 'Calories', value: `${data.totalCalories.toLocaleString()} kcal`, color: 'text-primary' },
    { icon: Dumbbell, label: 'Workouts', value: data.totalWorkouts, color: 'text-primary' },
    { icon: Zap, label: 'Streak', value: `${data.streak} days`, color: 'text-primary' },
    { icon: Timer, label: 'Total Time', value: `${data.totalMinutes} min`, color: 'text-primary' },
    { icon: Activity, label: 'This Week', value: data.weeklyWorkouts, color: 'text-primary' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'Champ'} 💪</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your fitness overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="bg-card border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Goals */}
      {data.goals.length > 0 && (
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Active Goals</h3>
          <div className="space-y-3">
            {data.goals.slice(0, 3).map((g: any) => {
              const pct = g.targetValue ? Math.min(100, Math.round(((g.currentValue || 0) / g.targetValue) * 100)) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{g.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <Bar dataKey="calories" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Workout Minutes */}
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-4">Workout Duration (min)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card className="bg-card border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Recent Workouts</h3>
        {data.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No workouts yet. Start your first workout!</p>
        ) : (
          <div className="space-y-2">
            {data.recent.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{s.durationMinutes} min</span>
                  <span>{s.caloriesBurned} kcal</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
