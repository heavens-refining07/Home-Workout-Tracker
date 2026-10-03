import { useState, useEffect, useMemo } from 'react';
import { getHistory } from 'zitejs/api';
import { ChevronLeft, ChevronRight, Dumbbell, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';

export default function WorkoutCalendar() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    getHistory({}).then(r => { setSessions(r.sessions); setLoading(false); });
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const sessionsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    sessions.forEach(s => { if (s.date) { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); } });
    return map;
  }, [sessions]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedSessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Workout Calendar</h1>

      <Card className="bg-card border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="font-semibold">{currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySessions = sessionsByDate[dateStr] || [];
            const hasCompleted = daySessions.some(s => s.status === 'Completed');
            const hasSkipped = daySessions.some(s => s.status === 'Skipped');
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;

            return (
              <button key={day} onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative
                  ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}
                `}>
                {day}
                {daySessions.length > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${hasCompleted ? 'bg-foreground' : hasSkipped ? 'bg-primary' : 'bg-muted-foreground'}`} />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Skipped</span>
        </div>
      </Card>

      {selectedDate && (
        <Card className="bg-card border-border p-4">
          <h3 className="font-semibold mb-3">{selectedDate}</h3>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts on this day. Rest day! 😴</p>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    {s.status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-foreground" /> : <XCircle className="w-4 h-4 text-primary" />}
                    <span className="text-sm font-medium">{s.title}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{s.durationMinutes} min</span>
                    <span>{s.caloriesBurned} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
