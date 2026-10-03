import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, toggleFavorite } from 'zitejs/api';
import { Search, Heart, ChevronDown, ChevronUp, Dumbbell, Play, ExternalLink } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Card } from '@project/components/ui/card';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body', 'Yoga', 'Stretching'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const equipmentOpts = ['All', 'No Equipment', 'Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Home Gym'];

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function VideoEmbed({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const vid = getYouTubeId(url);
  if (!vid) return null;

  if (!playing) {
    return (
      <button aria-label="Play exercise demonstration" onClick={() => setPlaying(true)} className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 group">
        <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="Video thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden">
      <iframe
        title="Exercise demonstration video"
        referrerPolicy="strict-origin-when-cross-origin"
        src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [equipment, setEquipment] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getExercises({
      search: search || undefined,
      category: category === 'All' ? undefined : category,
      difficulty: difficulty === 'All' ? undefined : difficulty,
      equipment: equipment === 'All' ? undefined : equipment,
    }).then(r => { setExercises(r.exercises); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category, difficulty, equipment]);

  const handleSearch = () => load();

  const handleFav = async (e: any) => {
    await toggleFavorite({ exerciseId: e.id, favRecordId: e.isFavorite ? e.favRecordId : undefined });
    load();
  };

  const diffColor = (d: string) => d === 'Beginner' ? 'bg-secondary text-secondary-foreground' : d === 'Intermediate' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary';

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <Badge variant="secondary"><Dumbbell className="w-3 h-3 mr-1" />{exercises.length} exercises</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={equipment} onValueChange={setEquipment}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{equipmentOpts.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : exercises.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No exercises found</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {exercises.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className="bg-card border-border overflow-hidden">
                {/* Exercise image */}
                {e.image && (
                  <div className="w-full h-36 overflow-hidden">
                    <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{e.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{e.category}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{e.muscleGroup}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${diffColor(e.difficulty)}`}>{e.difficulty}</span>
                      </div>
                    </div>
                    <button onClick={() => handleFav(e)} className="p-1.5 shrink-0">
                      <Heart className={`w-5 h-5 transition-colors ${e.isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
                    </button>
                  </div>
                  {e.instructions && <p className="text-sm text-muted-foreground mt-3">{e.instructions}</p>}
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{e.defaultSets} sets</span>
                    <span>{e.defaultReps} reps</span>
                    <span>{e.defaultDuration}s</span>
                    <span>{e.equipment}</span>
                  </div>
                  <button onClick={() => setExpanded(expanded === e.id ? null : e.id)} className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                    {expanded === e.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expanded === e.id ? 'Hide' : 'Show'} details & video
                  </button>
                  <Button onClick={() => navigate(`/workout?exerciseId=${encodeURIComponent(e.id)}`)} size="sm" className="mt-3 w-full" aria-label={`Start ${e.name}`}>
                    <Play className="w-4 h-4 mr-2" /> Start exercise
                  </Button>
                </div>
                <AnimatePresence>
                  {expanded === e.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 py-3 bg-muted/30 space-y-3">
                        {/* Video */}
                        {e.videoUrl && <VideoEmbed url={e.videoUrl} />}

                        {e.instructions && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Instructions</p>
                            <p className="text-sm">{e.instructions}</p>
                          </div>
                        )}
                        {e.steps && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Steps & Positions</p>
                            <div className="space-y-1.5">
                              {e.steps.split('\n').filter(Boolean).map((step: string, si: number) => (
                                <div key={si} className="flex gap-2 items-start text-sm">
                                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">{si + 1}</span>
                                  <span>{step.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Rest: {e.restTime}s</span>
                          <span>Cal/set: {e.caloriesPerSet}</span>
                        </div>
                        {e.videoUrl && (
                          <a href={e.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="w-3 h-3" /> Watch on YouTube
                          </a>
                        )}
                        {e.sourceUrl && <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-primary">Form guide & video source: {e.videoSource || 'Exercise guide'}</a>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
