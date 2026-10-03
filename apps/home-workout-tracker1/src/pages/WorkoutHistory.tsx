import { useState, useEffect } from 'react';
import { getHistory } from 'zitejs/api';
import { Search, History, Filter } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Card } from '@project/components/ui/card';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';

export default function WorkoutHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = () => {
    setLoading(true);
    getHistory({ search: search || undefined }).then(r => { setSessions(r.sessions); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const filtered = statusFilter === 'All' ? sessions : sessions.filter(s => s.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const statusColor = (s: string) => s === 'Completed' ? 'bg-secondary text-secondary-foreground' : s === 'In Progress' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary';

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Workout History</h1>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search workouts..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div> : sorted.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No workouts recorded yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map(s => (
            <Card key={s.id} className="bg-card border-border p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.date}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="hidden sm:inline">{s.totalExercises || 0} exercises</span>
                <span className="hidden sm:inline">{s.totalSets || 0} sets</span>
                <span>{s.durationMinutes || 0} min</span>
                <span>{s.caloriesBurned || 0} kcal</span>
                <span className={`px-2 py-0.5 rounded-full ${statusColor(s.status)}`}>{s.status}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
