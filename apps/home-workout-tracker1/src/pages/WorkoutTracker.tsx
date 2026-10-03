import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getExercises, startWorkout, logExercise, finishWorkout } from 'zitejs/api';
import { Play, Pause, RotateCcw, CheckCircle2, Timer, Dumbbell, Trophy, ArrowRight, ChevronDown, ChevronUp, BookOpen, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@project/components/ui/button';
import { Card } from '@project/components/ui/card';
import { Input } from '@project/components/ui/input';
import { toast } from 'sonner';

type Phase = 'select' | 'countdown' | 'workout' | 'rest' | 'done';

function getYTId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function MiniVideo({ url }: { url: string }) {
  const [on, setOn] = useState(false);
  const vid = getYTId(url);
  if (!vid) return null;
  if (!on) return (
    <button onClick={() => setOn(true)} className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 group">
      <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
        </div>
      </div>
      <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Watch demo</span>
    </button>
  );
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden">
      <iframe title="Exercise demonstration video" referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0" />
    </div>
  );
}

/* Animated circular progress ring */
function ProgressRing({ progress, size = 120, stroke = 6 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - progress) }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* Pulse animation for set completion */
function SetCompleteBurst() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="w-32 h-32 rounded-full bg-primary/30"
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1.2, rotate: 15 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
      >
        <CheckCircle2 className="w-16 h-16 text-primary" />
      </motion.div>
    </motion.div>
  );
}

export default function WorkoutTracker() {
  const [searchParams] = useSearchParams();
  const linkedExerciseId = searchParams.get('exerciseId');
  const [exercises, setExercises] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [phase, setPhase] = useState<Phase>('select');
  const [sessionId, setSessionId] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [workoutStart, setWorkoutStart] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [restLeft, setRestLeft] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [showSteps, setShowSteps] = useState<string | null>(null);
  const [countdownVal, setCountdownVal] = useState(3);
  const [showBurst, setShowBurst] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;
    getExercises({}).then(r => {
      if (!active) return;
      setExercises(r.exercises);
      if (linkedExerciseId) {
        const exercise = r.exercises.find((ex: any) => ex.id === linkedExerciseId);
        if (exercise) { setSelected([exercise]); setShowSteps(exercise.id); }
        else toast.error('This exercise is no longer available. Choose another exercise.');
      }
    }).catch(() => toast.error('Unable to load exercises. Please reload and try again.'));
    return () => { active = false; };
  }, [linkedExerciseId]);

  const toggleSelect = (ex: any) => {
    setSelected(prev => prev.find(e => e.id === ex.id) ? prev.filter(e => e.id !== ex.id) : [...prev, ex]);
  };

  const handleStart = async () => {
    if (selected.length === 0) { toast.error('Select at least one exercise'); return; }
    const res = await startWorkout({ title: `Workout - ${new Date().toLocaleDateString()}` });
    setSessionId(res.session.id);
    setWorkoutStart(Date.now());
    setCurrentIdx(0);
    setCurrentSet(1);
    setReps(selected[0]?.defaultReps || 10);
    setWeight(0);
    // Start countdown
    setCountdownVal(3);
    setPhase('countdown');
  };

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownVal <= 0) { setPhase('workout'); return; }
    const t = setTimeout(() => setCountdownVal(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownVal]);

  const handleCompleteSet = async () => {
    const ex = selected[currentIdx];
    const cals = ex.caloriesPerSet || 5;
    await logExercise({ sessionId, exerciseId: ex.id, setNumber: currentSet, reps, weight, calories: cals });
    setCompletedSets(prev => prev + 1);
    setCompletedReps(prev => prev + reps);
    setTotalCalories(prev => prev + cals);
    // Show burst animation
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 900);
    toast.success(`Set ${currentSet} complete!`);

    if (currentSet >= (ex.defaultSets || 3)) {
      if (currentIdx + 1 >= selected.length) {
        await handleFinish();
      } else {
        startRest(ex.restTime || 60);
      }
    } else {
      setCurrentSet(prev => prev + 1);
      startRest(ex.restTime || 60);
    }
  };

  const startRest = (seconds: number) => {
    setRestTime(seconds);
    setRestLeft(seconds);
    setRestPaused(false);
    setPhase('rest');
  };

  useEffect(() => {
    if (phase === 'rest' && restLeft > 0 && !restPaused) {
      timerRef.current = setTimeout(() => setRestLeft(prev => prev - 1), 1000);
    }
    if (phase === 'rest' && restLeft === 0) {
      const ex = selected[currentIdx];
      if (currentSet > (ex?.defaultSets || 3)) {
        setCurrentIdx(prev => prev + 1);
        setCurrentSet(1);
        const nextEx = selected[currentIdx + 1];
        if (nextEx) setReps(nextEx.defaultReps || 10);
      }
      setPhase('workout');
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, restLeft, restPaused]);

  const handleFinish = async () => {
    const dur = Math.round((Date.now() - workoutStart) / 60000);
    await finishWorkout({ sessionId, durationMinutes: dur, totalExercises: selected.length, totalSets: completedSets + 1, totalReps: completedReps + reps, caloriesBurned: totalCalories, completion: 100 });
    setPhase('done');
  };

  const skipRest = () => setRestLeft(0);

  // ─── COUNTDOWN ───
  if (phase === 'countdown') {
    return (
      <div className="p-4 lg:p-6 max-w-md mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.p className="text-muted-foreground text-sm mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Get ready!
          </motion.p>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdownVal}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              className="text-8xl font-bold text-primary"
            >
              {countdownVal || 'GO!'}
            </motion.div>
          </AnimatePresence>
          <motion.p
            className="mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            First up: <span className="text-foreground font-medium">{selected[0]?.name}</span>
          </motion.p>
        </div>
      </div>
    );
  }

  // ─── DONE ───
  if (phase === 'done') {
    const dur = Math.round((Date.now() - workoutStart) / 60000);
    const stats = [
      { l: 'Exercises', v: selected.length, icon: Dumbbell },
      { l: 'Sets', v: completedSets, icon: CheckCircle2 },
      { l: 'Reps', v: completedReps, icon: Zap },
      { l: 'Duration', v: `${dur} min`, icon: Timer },
      { l: 'Calories', v: `${totalCalories} kcal`, icon: Flame },
      { l: 'Completion', v: '100%', icon: Trophy },
    ];
    return (
      <motion.div className="p-4 lg:p-6 max-w-lg mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="bg-card border-border p-8 text-center overflow-hidden relative">
          {/* Confetti-like animated dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/40"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: 0,
                scale: Math.random() * 2 + 1,
              }}
              transition={{ duration: 1.5, delay: i * 0.05 }}
              style={{ left: '50%', top: '30%' }}
            />
          ))}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <motion.h2 className="text-2xl font-bold mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Workout Complete! 🎉
          </motion.h2>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.l}
                className="bg-muted rounded-lg p-3 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <s.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground leading-tight">{s.l}</p>
                  <p className="text-lg font-bold leading-tight">{s.v}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <Button onClick={() => { setPhase('select'); setSelected([]); setCompletedSets(0); setCompletedReps(0); setTotalCalories(0); }} className="mt-6 w-full">
              Start New Workout
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  // ─── REST ───
  if (phase === 'rest') {
    const progress = restTime > 0 ? (restTime - restLeft) / restTime : 0;
    return (
      <motion.div className="p-4 lg:p-6 max-w-md mx-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <Card className="bg-card border-border p-8 text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Timer className="w-12 h-12 text-primary mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Rest Time</h2>
          <div className="flex justify-center my-6 relative">
            <ProgressRing progress={progress} size={140} stroke={8} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold text-primary">
                {Math.floor(restLeft / 60)}:{(restLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setRestPaused(!restPaused)}>{restPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</Button>
            <Button variant="outline" onClick={() => { setRestLeft(restTime); setRestPaused(false); }}><RotateCcw className="w-4 h-4" /></Button>
            <Button onClick={skipRest}>Skip <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            {[30, 60, 90, 120].map(t => (
              <button key={t} onClick={() => { setRestLeft(t); setRestTime(t); setRestPaused(false); }} className={`px-3 py-1 rounded-full text-xs transition-colors ${restTime === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{t}s</button>
            ))}
          </div>
          {/* Next exercise preview */}
          {currentIdx + 1 < selected.length && currentSet >= (selected[currentIdx]?.defaultSets || 3) && (
            <motion.p className="mt-4 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Next: <span className="text-foreground font-medium">{selected[currentIdx + 1]?.name}</span>
            </motion.p>
          )}
        </Card>
      </motion.div>
    );
  }

  // ─── WORKOUT ───
  if (phase === 'workout') {
    const ex = selected[currentIdx];
    const setProgress = currentSet / (ex.defaultSets || 3);
    const overallProgress = (currentIdx + setProgress / (ex.defaultSets || 3)) / selected.length;
    return (
      <div className="p-4 lg:p-6 max-w-md mx-auto space-y-4">
        {showBurst && <SetCompleteBurst />}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Exercise {currentIdx + 1} of {selected.length}</span>
            <span>{Math.round(overallProgress * 100)}% done</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${overallProgress * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold">Workout In Progress</h2>
        </motion.div>

        {/* How to Start & Video */}
        <AnimatePresence mode="wait">
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Card className="bg-card border-border p-4 overflow-hidden">
              {/* Exercise position image */}
              {ex.image && (
                <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
                  <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                </div>
              )}
              {ex.videoUrl && <div className="mb-3"><MiniVideo url={ex.videoUrl} /></div>}
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" /> How to Start — {ex.name}
              </h4>
              {ex.instructions && <p className="text-sm text-muted-foreground mb-2">{ex.instructions}</p>}
              {ex.steps && (
                <div className="space-y-1.5">
                  {ex.steps.split('\n').filter(Boolean).map((step: string, i: number) => (
                    <motion.div
                      key={i}
                      className="flex gap-2 items-start text-sm"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">{i + 1}</span>
                      <span>{step.replace(/^\d+\.\s*/, '')}</span>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-muted px-2 py-0.5 rounded-full">{ex.equipment || 'No Equipment'}</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">{ex.difficulty}</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">{ex.muscleGroup}</span>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Logging card with set indicators */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-card border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{ex.name}</h3>
              <div className="flex gap-1">
                {Array.from({ length: ex.defaultSets || 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < currentSet - 1 ? 'bg-primary' : i === currentSet - 1 ? 'bg-primary/50 ring-2 ring-primary' : 'bg-muted'}`}
                    animate={i === currentSet - 1 ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Set</span>
                <motion.span className="font-bold text-primary" key={currentSet} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {currentSet} / {ex.defaultSets || 3}
                </motion.span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Reps</label>
                <Input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Weight (kg)</label>
                <Input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="mt-1" />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button onClick={handleCompleteSet} className="w-full mt-4">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Set
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Live stats bar */}
        <motion.div
          className="flex gap-4 text-xs justify-center bg-muted/50 rounded-full py-2 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-primary" /> {completedSets} sets</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {completedReps} reps</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-primary" /> {totalCalories} cal</span>
        </motion.div>

        <Button variant="destructive" onClick={handleFinish} className="w-full">Finish Workout Early</Button>
      </div>
    );
  }

  // ─── SELECT ───
  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
      <motion.h1 className="text-2xl font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Start a Workout</motion.h1>
      <p className="text-muted-foreground text-sm">Select exercises for your workout session</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {exercises.map((ex, i) => {
          const isSelected = selected.find(s => s.id === ex.id);
          const stepsOpen = showSteps === ex.id;
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className={`rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.15)]' : 'border-border bg-card hover:border-muted-foreground/30'}`}
            >
              <button onClick={() => toggleSelect(ex)} className="text-left p-3 w-full">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{ex.name}</p>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{ex.category}</span>•<span>{ex.defaultSets}×{ex.defaultReps}</span>•<span>{ex.equipment || 'No Equipment'}</span>
                </div>
              </button>
              <div className="px-3 pb-2">
                <button onClick={() => setShowSteps(stepsOpen ? null : ex.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  {stepsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {stepsOpen ? 'Hide' : 'How to start'}
                </button>
                <AnimatePresence>
                  {stepsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1 pb-1">
                        {ex.videoUrl && <div className="mb-2"><MiniVideo url={ex.videoUrl} /></div>}
                        {ex.instructions && <p className="text-xs text-muted-foreground mb-1">{ex.instructions}</p>}
                        {ex.steps && ex.steps.split('\n').filter(Boolean).map((step: string, si: number) => (
                          <div key={si} className="flex gap-2 items-start text-xs">
                            <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-semibold">{si + 1}</span>
                            <span className="text-muted-foreground">{step.replace(/^\d+\.\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            className="sticky bottom-20 lg:bottom-4"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Button onClick={handleStart} className="w-full shadow-lg" size="lg">
              <Play className="w-4 h-4 mr-2" /> Start Workout ({selected.length} exercises)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
