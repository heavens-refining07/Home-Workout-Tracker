import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { Toaster } from '@project/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutTracker from './pages/WorkoutTracker';
import WorkoutPlans from './pages/WorkoutPlans';
import BMICalculator from './pages/BMICalculator';
import Progress from './pages/Progress';
import BodyMeasurements from './pages/BodyMeasurements';
import Goals from './pages/Goals';
import WorkoutHistory from './pages/WorkoutHistory';
import WorkoutCalendar from './pages/WorkoutCalendar';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect();
  }, [isLoading, user]);
  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/workout" element={<WorkoutTracker />} />
        <Route path="/plans" element={<WorkoutPlans />} />
        <Route path="/bmi" element={<BMICalculator />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/measurements" element={<BodyMeasurements />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/calendar" element={<WorkoutCalendar />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="light" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
