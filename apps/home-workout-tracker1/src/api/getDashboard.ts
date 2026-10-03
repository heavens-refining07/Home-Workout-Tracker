import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets dashboard stats for the signed-in user',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ context }) => {
    const uid = context.user.id;
    const profile = await zite.profiles.findOne({ filters: { user: uid } });
    
    // Sessions
    const { records: sessions } = await zite.workoutSessions.findAll({ filters: { user: uid }, limit: 500 });
    const completed = sessions.filter(s => s.status === 'Completed');
    const totalCalories = completed.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const totalMinutes = completed.reduce((s, w) => s + (w.durationMinutes || 0), 0);
    
    // Streak calculation
    const dates = completed.map(s => s.date).filter(Boolean).sort().reverse();
    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    for (const d of uniqueDates) {
      if (d === checkDate || d === getPrevDay(checkDate)) {
        streak++;
        checkDate = d;
      } else break;
    }

    // BMI
    const latestBmi = await zite.bmiRecords.findOne({ filters: { user: uid } });
    
    // Weekly data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const thisWeek = completed.filter(s => s.date && s.date >= weekAgo);
    
    // Goals
    const { records: goals } = await zite.fitnessGoals.findAll({ filters: { user: uid, status: 'Active' } });

    // Achievements
    const { records: achievements } = await zite.userAchievements.findAll({ filters: { user: uid } });

    // Weekly chart data
    const weeklyData: { day: string; workouts: number; calories: number; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = completed.filter(s => s.date === dateStr);
      weeklyData.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        workouts: daySessions.length,
        calories: daySessions.reduce((s, w) => s + (w.caloriesBurned || 0), 0),
        minutes: daySessions.reduce((s, w) => s + (w.durationMinutes || 0), 0),
      });
    }

    // Recent
    const recent = completed.slice(0, 5);

    return {
      data: {
        profile,
        totalWorkouts: completed.length,
        totalCalories,
        totalMinutes,
        streak,
        weeklyWorkouts: thisWeek.length,
        bmi: latestBmi?.bmiValue || null,
        weight: profile?.weight || null,
        goals,
        achievements: achievements.length,
        weeklyData,
        recent,
      }
    };
  },
});

function getPrevDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
