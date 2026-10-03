import { useState, useEffect, useRef } from 'react';
import { getDashboard, getAchievements, getProgress, getProfile, getBmiHistory } from 'zitejs/api';
import { useAuth } from 'zitejs/auth';
import { FileText, Printer, Download } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';

export default function Reports() {
  const { user } = useAuth();
  const [dash, setDash] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [bmi, setBmi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getDashboard({}),
      getAchievements({}),
      getProfile({}),
      getBmiHistory({}),
    ]).then(([d, a, p, b]) => {
      setDash(d.data);
      setAchievements(a.achievements);
      setProfile(p.profile);
      setBmi(b.records);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Create a text report for download
    const lines = [
      '=== FITNESS REPORT ===',
      `Name: ${profile?.displayName || user?.name}`,
      `Email: ${user?.email}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      '--- Stats ---',
      `Total Workouts: ${dash?.totalWorkouts || 0}`,
      `Total Calories: ${dash?.totalCalories || 0} kcal`,
      `Total Time: ${dash?.totalMinutes || 0} min`,
      `Current Streak: ${dash?.streak || 0} days`,
      `BMI: ${dash?.bmi || 'N/A'}`,
      `Weight: ${profile?.weight || 'N/A'} kg`,
      '',
      '--- Achievements ---',
      ...achievements.map(a => `✓ ${a.name} - ${a.description}`),
      '',
      '--- Goals ---',
      ...(dash?.goals || []).map((g: any) => `${g.name}: ${g.currentValue || 0}/${g.targetValue} ${g.unit}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6"><div className="h-96 bg-muted rounded-xl animate-pulse max-w-3xl mx-auto" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fitness Report</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
          <Button size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-1" /> Download</Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-4 print:text-black">
        {/* User Info */}
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> User Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {profile?.displayName || user?.name}</div>
            <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
            <div><span className="text-muted-foreground">Age:</span> {profile?.age || 'N/A'}</div>
            <div><span className="text-muted-foreground">Gender:</span> {profile?.gender || 'N/A'}</div>
            <div><span className="text-muted-foreground">Height:</span> {profile?.height || 'N/A'} cm</div>
            <div><span className="text-muted-foreground">Weight:</span> {profile?.weight || 'N/A'} kg</div>
            <div><span className="text-muted-foreground">Fitness Level:</span> {profile?.fitnessLevel || 'N/A'}</div>
            <div><span className="text-muted-foreground">Goal:</span> {profile?.fitnessGoal || 'N/A'}</div>
          </div>
        </Card>

        {/* Workout Stats */}
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3">Workout Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: 'Total Workouts', v: dash?.totalWorkouts || 0 },
              { l: 'Total Calories', v: `${dash?.totalCalories || 0} kcal` },
              { l: 'Total Time', v: `${dash?.totalMinutes || 0} min` },
              { l: 'Current Streak', v: `${dash?.streak || 0} days` },
              { l: 'BMI', v: dash?.bmi?.toFixed(1) || 'N/A' },
              { l: 'Weekly Workouts', v: dash?.weeklyWorkouts || 0 },
              { l: 'Achievements', v: achievements.length },
              { l: 'Active Goals', v: dash?.goals?.length || 0 },
            ].map(s => (
              <div key={s.l} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.l}</p>
                <p className="text-lg font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        {dash?.goals?.length > 0 && (
          <Card className="bg-card border-border p-5">
            <h3 className="font-semibold mb-3">Goal Progress</h3>
            <div className="space-y-3">
              {dash.goals.map((g: any) => {
                const pct = g.targetValue ? Math.min(100, Math.round(((g.currentValue || 0) / g.targetValue) * 100)) : 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1"><span>{g.name}</span><span>{pct}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-card border-border p-5">
            <h3 className="font-semibold mb-3">Achievements Earned</h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map(a => (
                <span key={a.id} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">{a.icon} {a.name}</span>
              ))}
            </div>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">Report generated on {new Date().toLocaleDateString('en', { dateStyle: 'full' })}</p>
      </div>
    </div>
  );
}
