import { useState, useEffect } from 'react';
import { getProgress } from 'zitejs/api';
import { Card } from '@project/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const periods = [{ label: '7 Days', days: 7 }, { label: '30 Days', days: 30 }, { label: '3 Months', days: 90 }, { label: '6 Months', days: 180 }, { label: '1 Year', days: 365 }];

export default function Progress() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProgress({ days }).then(r => { setData(r.data); setLoading(false); });
  }, [days]);

  const sessions = data?.sessions || [];
  const bmiRecords = data?.bmiRecords || [];
  const measurements = data?.measurements || [];

  const completed = sessions.filter((s: any) => s.status === 'Completed');

  // Group by date
  const dateMap: Record<string, { workouts: number; calories: number; minutes: number }> = {};
  completed.forEach((s: any) => {
    if (!s.date) return;
    if (!dateMap[s.date]) dateMap[s.date] = { workouts: 0, calories: 0, minutes: 0 };
    dateMap[s.date].workouts++;
    dateMap[s.date].calories += s.caloriesBurned || 0;
    dateMap[s.date].minutes += s.durationMinutes || 0;
  });
  const workoutChart = Object.entries(dateMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date: date.slice(5), ...v }));
  const bmiChart = bmiRecords.map((b: any) => ({ date: b.date?.slice(5), bmi: b.bmiValue }));
  const weightChart = measurements.map((m: any) => ({ date: m.date?.slice(5), weight: m.weight }));

  const ttStyle = { background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Progress Tracking</h1>
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button key={p.days} onClick={() => setDays(p.days)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${days === p.days ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{p.label}</button>
        ))}
      </div>

      {loading ? <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />)}</div> : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-card border-border p-4">
            <h3 className="font-semibold mb-3">Workout Frequency</h3>
            {workoutChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workoutChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Bar dataKey="workouts" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>}
          </Card>

          <Card className="bg-card border-border p-4">
            <h3 className="font-semibold mb-3">Calories Burned</h3>
            {workoutChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={workoutChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Line type="monotone" dataKey="calories" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-4))' }} /></LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>}
          </Card>

          <Card className="bg-card border-border p-4">
            <h3 className="font-semibold mb-3">BMI Progress</h3>
            {bmiChart.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bmiChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><YAxis domain={['auto', 'auto']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Line type="monotone" dataKey="bmi" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} /></LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Record more BMI entries to see progress</p>}
          </Card>

          <Card className="bg-card border-border p-4">
            <h3 className="font-semibold mb-3">Weight Progress</h3>
            {weightChart.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><YAxis domain={['auto', 'auto']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Line type="monotone" dataKey="weight" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-3))' }} /></LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Record body measurements to see progress</p>}
          </Card>

          <Card className="bg-card border-border p-4 md:col-span-2">
            <h3 className="font-semibold mb-3">Workout Duration</h3>
            {workoutChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workoutChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Bar dataKey="minutes" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>}
          </Card>
        </div>
      )}
    </div>
  );
}
