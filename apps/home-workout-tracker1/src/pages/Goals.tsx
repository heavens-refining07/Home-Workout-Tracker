import { useState, useEffect } from 'react';
import { manageGoals } from 'zitejs/api';
import { Target, Plus, Trash2 } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@project/components/ui/dialog';
import { Progress } from '@project/components/ui/progress';
import { Badge } from '@project/components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';

const types = ['Weight Target', 'Workout Count', 'Weekly Frequency', 'Strength', 'Custom'];

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Custom', targetValue: '', unit: '', deadline: '' });

  const load = () => { setLoading(true); manageGoals({ action: 'list' }).then(r => { setGoals(r.goals); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    await manageGoals({ action: 'create', name: form.name, type: form.type, targetValue: parseFloat(form.targetValue) || 0, unit: form.unit, deadline: form.deadline || undefined });
    toast.success('Goal created!');
    setOpen(false);
    setForm({ name: '', type: 'Custom', targetValue: '', unit: '', deadline: '' });
    load();
  };

  const handleUpdate = async (id: string, currentValue: number) => {
    await manageGoals({ action: 'update', id, currentValue });
    load();
  };

  const handleComplete = async (id: string) => {
    await manageGoals({ action: 'update', id, status: 'Completed' });
    toast.success('Goal completed! 🎉');
    load();
  };

  const handleDelete = async (id: string) => {
    await manageGoals({ action: 'delete', id });
    toast.success('Goal deleted');
    load();
  };

  const statusColor = (s: string) => s === 'Active' ? 'bg-primary/10 text-primary' : s === 'Completed' ? 'bg-secondary text-secondary-foreground' : s === 'Paused' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary';

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fitness Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Fitness Goal</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Goal name (e.g. Lose 5 kg)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Target</label><Input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Unit</label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, workouts..." /></div>
              </div>
              <div><label className="text-xs text-muted-foreground">Deadline</label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div> : goals.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No goals yet. Set your first fitness goal!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = g.targetValue ? Math.min(100, Math.round(((g.currentValue || 0) / g.targetValue) * 100)) : 0;
            return (
              <Card key={g.id} className="bg-card border-border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="secondary">{g.type}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(g.status)}`}>{g.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {g.status === 'Active' && <Button size="sm" variant="ghost" onClick={() => handleComplete(g.id)} className="text-xs text-foreground">Complete</Button>}
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete goal?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(g.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={pct} className="flex-1 h-2" />
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Current: {g.currentValue || 0} {g.unit}</span>
                  <span>Target: {g.targetValue} {g.unit}</span>
                  {g.deadline && <span>Due: {g.deadline}</span>}
                </div>
                {g.status === 'Active' && (
                  <div className="flex gap-2 mt-3">
                    <Input type="number" placeholder="Update progress" className="flex-1" onKeyDown={e => { if (e.key === 'Enter') { handleUpdate(g.id, parseFloat((e.target as HTMLInputElement).value)); (e.target as HTMLInputElement).value = ''; } }} />
                    <Button size="sm" variant="secondary" onClick={e => { const input = (e.target as HTMLElement).parentElement?.querySelector('input'); if (input) { handleUpdate(g.id, parseFloat(input.value)); input.value = ''; } }}>Update</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
