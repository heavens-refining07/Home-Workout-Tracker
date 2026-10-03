import { useEffect, useState } from 'react';
import { managePlans } from 'zitejs/api';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@project/components/ui/dialog';
import { Badge } from '@project/components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';

const goals = ['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const equips = ['No Equipment', 'Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Home Gym'];

export default function WorkoutPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', goal: 'General Fitness', fitnessLevel: 'Beginner', durationMinutes: 30, equipment: 'No Equipment', daysPerWeek: 3, description: '' });

  const load = () => {
    setLoading(true);
    managePlans({ action: 'list' }).then(r => { setPlans(r.plans); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    await managePlans({ action: 'create', ...form });
    toast.success('Plan created!');
    setOpen(false);
    setForm({ name: '', goal: 'General Fitness', fitnessLevel: 'Beginner', durationMinutes: 30, equipment: 'No Equipment', daysPerWeek: 3, description: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    await managePlans({ action: 'delete', id });
    toast.success('Plan deleted');
    load();
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Plans</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Plan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Workout Plan</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Plan name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.goal} onValueChange={v => setForm({ ...form, goal: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{goals.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.fitnessLevel} onValueChange={v => setForm({ ...form, fitnessLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.equipment} onValueChange={v => setForm({ ...form, equipment: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{equips.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground">Duration (min)</label><Input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Days/week</label><Input type="number" value={form.daysPerWeek} onChange={e => setForm({ ...form, daysPerWeek: Number(e.target.value) })} /></div>
              </div>
              <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Button onClick={handleCreate} className="w-full">Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div> : plans.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No workout plans yet. Create your first plan!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map(p => (
            <Card key={p.id} className="bg-card border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="secondary">{p.goal}</Badge>
                    <Badge variant="secondary">{p.fitnessLevel}</Badge>
                    <Badge variant="secondary">{p.equipment}</Badge>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{p.durationMinutes} min</span>
                    <span>{p.daysPerWeek} days/week</span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete plan?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
