import { useNavigate } from 'react-router-dom';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { Activity, Dumbbell, TrendingUp, Target, Calendar, Trophy, Flame, Heart, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@project/components/ui/button';

const features = [
  { icon: Dumbbell, title: 'Exercise Library', desc: '30+ home exercises with step-by-step instructions' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Interactive charts to monitor your fitness journey' },
  { icon: Target, title: 'Custom Goals', desc: 'Set and track personalized fitness targets' },
  { icon: Calendar, title: 'Workout Calendar', desc: 'Schedule and track your daily workouts' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges and maintain workout streaks' },
  { icon: Flame, title: 'Calorie Tracking', desc: 'Monitor calories burned every session' },
];

const steps = [
  { num: '01', title: 'Create Profile', desc: 'Set up your fitness profile with your goals and measurements' },
  { num: '02', title: 'Choose a Plan', desc: 'Pick a workout plan matching your level and goals' },
  { num: '03', title: 'Start Working Out', desc: 'Follow guided exercises with built-in rest timers' },
  { num: '04', title: 'Track Progress', desc: 'Monitor improvements with charts and reports' },
];

const testimonials = [
  { name: 'Priya S.', text: 'This tracker helped me lose 8kg in 3 months working out from home!', rating: 5 },
  { name: 'Rahul M.', text: 'The exercise library with steps made it so easy to learn proper form.', rating: 5 },
  { name: 'Anita K.', text: 'Love the streak system — it keeps me motivated every single day.', rating: 5 },
];

export default function LandingPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl tracking-tight">FitTracker</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={() => nav('/dashboard')} size="sm">Go to Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => loginWithRedirect()}>Log In</Button>
                <Button size="sm" onClick={() => loginWithRedirect()}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero pt-36 sm:pt-40 pb-20 sm:pb-24 px-5">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Flame className="w-4 h-4" /> Your Home Fitness Companion
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.08] mb-8">
            Transform Your Body<br />
            <span className="text-primary">From Home</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Track workouts, monitor progress, and achieve your fitness goals with our comprehensive home workout tracking system. No gym required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => user ? nav('/dashboard') : loginWithRedirect()} className="text-base px-8 h-14 rounded-xl">
              Start Your Fitness Journey <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-base px-8 h-14 rounded-xl">
              Explore Features
            </Button>
          </div>
          <div className="flex justify-center mt-14 text-center divide-x divide-border">
            {[{ val: '30+', label: 'Exercises' }, { val: '500+', label: 'Users' }, { val: '10K+', label: 'Workouts' }].map(s => (
              <div key={s.label} className="px-6 sm:px-10">
                <p className="text-3xl sm:text-4xl font-bold text-foreground">{s.val}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-3">Everything You Need</h2>
          <p className="text-muted-foreground text-center mb-12">Comprehensive tools to manage your fitness journey</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="text-3xl font-extrabold text-primary mb-2">{s.num}</div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Why FitTracker?</h2>
          <div className="space-y-3">
            {['No gym membership needed — work out from home', 'Step-by-step exercise instructions for all levels', 'Track every set, rep, and calorie burned', 'Visual progress with interactive charts', 'Gamification with streaks and achievement badges', 'BMI calculator and body measurement tracking'].map(b => (
              <div key={b} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">What Users Say</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">"{t.text}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-10">
            <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ready to Get Fit?</h2>
            <p className="text-muted-foreground mb-6">Join hundreds of users tracking their home workouts. Free to start.</p>
            <Button size="lg" onClick={() => user ? nav('/dashboard') : loginWithRedirect()} className="px-8">
              Start Now — It's Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold">FitTracker</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Home Workout Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
