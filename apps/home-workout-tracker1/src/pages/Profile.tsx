import { useState, useEffect } from 'react';
import { getProfile, saveProfile } from 'zitejs/api';
import { useAuth, logout } from 'zitejs/auth';
import { User, Save, LogOut } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ displayName: '', age: '', gender: '', height: '', weight: '', fitnessLevel: 'Beginner', fitnessGoal: 'General Fitness' });

  useEffect(() => {
    getProfile({}).then(r => {
      setProfile(r.profile);
      setForm({
        displayName: r.profile.displayName || '',
        age: r.profile.age?.toString() || '',
        gender: r.profile.gender || '',
        height: r.profile.height?.toString() || '',
        weight: r.profile.weight?.toString() || '',
        fitnessLevel: r.profile.fitnessLevel || 'Beginner',
        fitnessGoal: r.profile.fitnessGoal || 'General Fitness',
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    await saveProfile({
      displayName: form.displayName || undefined,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      fitnessLevel: form.fitnessLevel || undefined,
      fitnessGoal: form.fitnessGoal || undefined,
    });
    toast.success('Profile updated!');
  };

  if (loading) return <div className="p-6"><div className="h-96 bg-muted rounded-xl animate-pulse max-w-lg mx-auto" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="bg-card border-border p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
            {form.displayName?.charAt(0) || user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold">{form.displayName || user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Display Name</label><Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Age</label><Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">Gender</label>
              <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Height (cm)</label><Input type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">Weight (kg)</label><Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fitness Level</label>
            <Select value={form.fitnessLevel} onValueChange={v => setForm({ ...form, fitnessLevel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fitness Goal</label>
            <Select value={form.fitnessGoal} onValueChange={v => setForm({ ...form, fitnessGoal: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} className="w-full"><Save className="w-4 h-4 mr-2" /> Save Profile</Button>
        </div>
      </Card>

      <Button variant="outline" onClick={() => logout()} className="w-full"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
    </div>
  );
}
