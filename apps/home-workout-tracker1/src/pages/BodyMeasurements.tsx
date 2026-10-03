import { useState, useEffect } from 'react';
import { saveMeasurement, getMeasurements } from 'zitejs/api';
import { Ruler, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { toast } from 'sonner';

const fields = ['weight', 'chest', 'waist', 'arms', 'hips', 'thighs'] as const;

export default function BodyMeasurements() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({ weight: '', chest: '', waist: '', arms: '', hips: '', thighs: '' });

  const load = () => { setLoading(true); getMeasurements({}).then(r => { setRecords(r.records); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const data: any = {};
    let hasValue = false;
    fields.forEach(f => {
      const v = parseFloat(form[f]);
      if (!isNaN(v) && v > 0) { data[f] = v; hasValue = true; }
    });
    if (!hasValue) { toast.error('Enter at least one measurement'); return; }
    await saveMeasurement(data);
    toast.success('Measurements saved!');
    setForm({ weight: '', chest: '', waist: '', arms: '', hips: '', thighs: '' });
    load();
  };

  // Sort by date desc
  const sorted = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const latest = sorted[0];
  const previous = sorted[1];

  const diff = (field: string) => {
    if (!latest || !previous) return null;
    const curr = latest[field];
    const prev = previous[field];
    if (curr == null || prev == null) return null;
    return curr - prev;
  };

  const DiffIcon = ({ val }: { val: number | null }) => {
    if (val == null || val === 0) return <Minus className="w-3 h-3 text-muted-foreground" />;
    return val > 0 ? <ArrowUpRight className="w-3 h-3 text-primary" /> : <ArrowDownRight className="w-3 h-3 text-foreground" />;
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Body Measurements</h1>

      <Card className="bg-card border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Record Measurements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fields.map(f => (
            <div key={f}>
              <label className="text-xs text-muted-foreground capitalize">{f} {f === 'weight' ? '(kg)' : '(cm)'}</label>
              <Input type="number" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} placeholder="0" />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} className="w-full mt-4">Save Measurements</Button>
      </Card>

      {latest && (
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3">Current vs Previous</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map(f => {
              const d = diff(f);
              return (
                <div key={f} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground capitalize">{f}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">{latest[f] ?? '—'}</span>
                    {d != null && (
                      <span className="flex items-center text-xs">
                        <DiffIcon val={d} />
                        {Math.abs(d).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {previous && <p className="text-xs text-muted-foreground mt-0.5">Prev: {previous[f] ?? '—'}</p>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {sorted.length > 0 && (
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3">History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4">Date</th>
                  {fields.map(f => <th key={f} className="text-right py-2 px-2 capitalize">{f}</th>)}
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 20).map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-muted-foreground">{r.date}</td>
                    {fields.map(f => <td key={f} className="text-right py-2 px-2">{r[f] ?? '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
