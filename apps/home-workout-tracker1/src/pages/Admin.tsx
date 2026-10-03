import { useState, useEffect } from 'react';
import { getAdmin, adminExercise } from 'zitejs/api';
import { getProfile } from 'zitejs/api';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Dumbbell, Activity, Flame, Timer, Plus, Trash2 } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@project/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';

export default function Admin() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<'overview' | 'users' | 'exercises'>('overview');
  const [exOpen, setExOpen] = useState(false);
  const [exForm, setExForm] = useState({ name: '', category: 'Chest', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'No Equipment', instructions: '', steps: '', videoUrl: '', defaultSets: 3, defaultReps: 10, caloriesPerSet: 5 });

  useEffect(() => {
    getProfile({}).then(r => {
      if (r.profile?.role !== 'Admin') { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      getAdmin({}).then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
    });
  }, []);

  const handleAddExercise = async () => {
    await adminExercise({ action: 'create', ...exForm });
    toast.success('Exercise added!');
    setExOpen(false);
    getAdmin({}).then(res => setData(res.data));
  };

  const handleDeleteExercise = async (id: string) => {
    await adminExercise({ action: 'delete', id });
    toast.success('Exercise deleted');
    getAdmin({}).then(res => setData(res.data));
  };

  if (loading) return <div className="p-6"><div className="h-96 bg-muted rounded-xl animate-pulse max-w-4xl mx-auto" /></div>;

  if (!isAdmin) return (
    <div className="p-6 max-w-md mx-auto text-center">
      <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
      <p className="text-muted-foreground text-sm mb-4">You need admin privileges to access this page. Contact your administrator to get access.</p>
      <Button onClick={() => nav('/dashboard')}>Go to Dashboard</Button>
    </div>
  );

  const ttStyle = { background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' };

  // Category chart data
  const catCounts: Record<string, number> = {};
  data?.exercises?.forEach((e: any) => { catCounts[e.category || 'Other'] = (catCounts[e.category || 'Other'] || 0) + 1; });
  const catChart = Object.entries(catCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'users', 'exercises'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, label: 'Total Users', value: data?.totalUsers || 0, color: 'text-primary' },
              { icon: Activity, label: 'Total Workouts', value: data?.totalWorkouts || 0, color: 'text-foreground' },
              { icon: Dumbbell, label: 'Exercises', value: data?.totalExercises || 0, color: 'text-primary' },
              { icon: Flame, label: 'Total Calories', value: data?.totalCalories?.toLocaleString() || 0, color: 'text-primary' },
              { icon: Activity, label: 'Completed', value: data?.completedWorkouts || 0, color: 'text-primary' },
              { icon: Timer, label: 'Avg Duration', value: `${data?.avgDuration || 0} min`, color: 'text-primary' },
              { icon: Users, label: 'Active Users', value: data?.activeUsers || 0, color: 'text-primary' },
            ].map(s => (
              <Card key={s.label} className="bg-card border-border p-4">
                <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-muted-foreground">{s.label}</span></div>
                <p className="text-xl font-bold">{s.value}</p>
              </Card>
            ))}
          </div>
          <Card className="bg-card border-border p-4">
            <h3 className="font-semibold mb-3">Exercises by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={catChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} angle={-45} textAnchor="end" height={80} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip contentStyle={ttStyle} /><Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {tab === 'users' && (
        <Card className="bg-card border-border p-4">
          <h3 className="font-semibold mb-3">Users ({data?.users?.length || 0})</h3>
          <div className="space-y-1">
            {data?.users?.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{u.name || u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{data?.profiles?.find((p: any) => { const puser = p.user; return Array.isArray(puser) ? puser.includes(u.id) : puser === u.id; })?.role || 'User'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'exercises' && (
        <>
          <div className="flex justify-end">
            <Dialog open={exOpen} onOpenChange={setExOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Exercise</Button></DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Exercise</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <Input placeholder="Exercise name" value={exForm.name} onChange={e => setExForm({ ...exForm, name: e.target.value })} />
                  <Select value={exForm.category} onValueChange={v => setExForm({ ...exForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body', 'Yoga', 'Stretching'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={exForm.difficulty} onValueChange={v => setExForm({ ...exForm, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Beginner', 'Intermediate', 'Advanced'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Instructions" value={exForm.instructions} onChange={e => setExForm({ ...exForm, instructions: e.target.value })} />
                  <Input type="url" placeholder="Exercise video URL (YouTube)" value={exForm.videoUrl} onChange={e => setExForm({ ...exForm, videoUrl: e.target.value })} />
                  <Input placeholder="Steps (line separated)" value={exForm.steps} onChange={e => setExForm({ ...exForm, steps: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-xs text-muted-foreground">Sets</label><Input type="number" value={exForm.defaultSets} onChange={e => setExForm({ ...exForm, defaultSets: Number(e.target.value) })} /></div>
                    <div><label className="text-xs text-muted-foreground">Reps</label><Input type="number" value={exForm.defaultReps} onChange={e => setExForm({ ...exForm, defaultReps: Number(e.target.value) })} /></div>
                    <div><label className="text-xs text-muted-foreground">Cal/set</label><Input type="number" value={exForm.caloriesPerSet} onChange={e => setExForm({ ...exForm, caloriesPerSet: Number(e.target.value) })} /></div>
                  </div>
                  <Button onClick={handleAddExercise} className="w-full">Add Exercise</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {data?.exercises?.map((e: any) => (
              <Card key={e.id} className="bg-card border-border p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.category} • {e.difficulty} • {e.equipment}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete exercise?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteExercise(e.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
