import { useState, useEffect } from 'react';
import { manageReminders } from 'zitejs/api';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Switch } from '@project/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@project/components/ui/dialog';
import { toast } from 'sonner';

const dayOptions = [
  { label: 'Mon', value: 'Monday' }, { label: 'Tue', value: 'Tuesday' }, { label: 'Wed', value: 'Wednesday' },
  { label: 'Thu', value: 'Thursday' }, { label: 'Fri', value: 'Friday' }, { label: 'Sat', value: 'Saturday' }, { label: 'Sun', value: 'Sunday' },
];

export default function Notifications() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', time: '08:00', days: [] as string[] });

  const load = () => { setLoading(true); manageReminders({ action: 'list' }).then(r => { setReminders(r.reminders); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const toggleDay = (day: string) => {
    setForm(prev => ({ ...prev, days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day] }));
  };

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    await manageReminders({ action: 'create', title: form.title, time: form.time, days: form.days });
    toast.success('Reminder created!');
    setOpen(false);
    setForm({ title: '', time: '08:00', days: [] });
    load();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await manageReminders({ action: 'update', id, active: !active });
    load();
  };

  const handleDelete = async (id: string) => {
    await manageReminders({ action: 'delete', id });
    toast.success('Reminder deleted');
    load();
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Reminders</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Reminder</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Reminder</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Reminder title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <div><label className="text-xs text-muted-foreground">Time</label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Days</label>
                <div className="flex gap-1.5 flex-wrap">
                  {dayOptions.map(d => (
                    <button key={d.value} onClick={() => toggleDay(d.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.days.includes(d.value) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{d.label}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Reminder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sample notification */}
      <Card className="bg-primary/10 border-primary/20 p-3 flex items-center gap-3">
        <Bell className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium">Your workout starts in 30 minutes.</p>
          <p className="text-xs text-muted-foreground">Keep your streak alive! 🔥</p>
        </div>
      </Card>

      {loading ? <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div> : reminders.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reminders set. Create one to stay on track!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {reminders.map(r => (
            <Card key={r.id} className="bg-card border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Switch checked={r.active} onCheckedChange={() => handleToggle(r.id, r.active)} />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${!r.active ? 'text-muted-foreground' : ''}`}>{r.title}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{r.time}</span>
                    <span>{r.days?.join(', ') || 'Every day'}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
