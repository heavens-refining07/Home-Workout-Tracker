import { useState, useEffect } from 'react';
import { saveBmi, getBmiHistory } from 'zitejs/api';
import { Calculator, TrendingUp } from 'lucide-react';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { toast } from 'sonner';

const bmiCategories = [
  { range: '< 18.5', label: 'Underweight', color: 'text-primary' },
  { range: '18.5 – 24.9', label: 'Normal', color: 'text-foreground' },
  { range: '25.0 – 29.9', label: 'Overweight', color: 'text-primary' },
  { range: '≥ 30.0', label: 'Obese', color: 'text-primary' },
];

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { getBmiHistory({}).then(r => setHistory(r.records)); }, []);

  const calculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) { toast.error('Enter valid weight and height'); return; }
    const res = await saveBmi({ weight: w, height: h });
    setResult({ bmi: res.record.bmiValue ?? 0, category: res.record.category ?? 'Normal' });
    toast.success('BMI recorded!');
    getBmiHistory({}).then(r => setHistory(r.records));
  };

  const getBmiColor = (cat: string) => cat === 'Underweight' ? 'text-primary' : cat === 'Normal' ? 'text-foreground' : cat === 'Overweight' ? 'text-primary' : 'text-primary';

  const chartData = history.map(h => ({ date: h.date, bmi: h.bmiValue })).reverse();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">BMI Calculator</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Calculate BMI</h3>
          <p className="text-xs text-muted-foreground mb-3">BMI = Weight (kg) / Height² (m)</p>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Weight (kg)</label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" /></div>
            <div><label className="text-xs text-muted-foreground">Height (cm)</label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" /></div>
            <Button onClick={calculate} className="w-full">Calculate BMI</Button>
          </div>
          {result && (
            <div className="mt-4 bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Your BMI</p>
              <p className={`text-4xl font-bold ${getBmiColor(result.category)}`}>{result.bmi.toFixed(1)}</p>
              <p className={`text-sm font-medium mt-1 ${getBmiColor(result.category)}`}>{result.category}</p>
              <p className="text-xs text-muted-foreground mt-1">Healthy range: 18.5 – 24.9</p>
            </div>
          )}
        </Card>

        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3">BMI Categories</h3>
          <div className="space-y-2">
            {bmiCategories.map(c => (
              <div key={c.label} className="flex justify-between items-center bg-muted/50 rounded-lg px-3 py-2">
                <span className={`text-sm font-medium ${c.color}`}>{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.range}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> BMI History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis domain={[15, 35]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <ReferenceLine y={18.5} stroke="hsl(var(--chart-2))" strokeDasharray="3 3" />
              <ReferenceLine y={25} stroke="hsl(var(--chart-4))" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="bmi" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="bg-card border-border p-5">
          <h3 className="font-semibold mb-3">BMI Records</h3>
          <div className="space-y-1">
            {history.slice(0, 10).map(h => (
              <div key={h.id} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2 text-sm">
                <span className="text-muted-foreground">{h.date}</span>
                <span>{h.weight} kg / {h.height} cm</span>
                <span className={`font-semibold ${getBmiColor(h.category)}`}>{h.bmiValue}</span>
                <span className={`text-xs ${getBmiColor(h.category)}`}>{h.category}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
