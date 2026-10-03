import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Finishes a workout session with totals',
  authenticated: true,
  inputSchema: z.object({
    sessionId: z.string(),
    durationMinutes: z.number(),
    totalExercises: z.number(),
    totalSets: z.number(),
    totalReps: z.number(),
    caloriesBurned: z.number(),
    completion: z.number(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    await zite.workoutSessions.update({
      id: input.sessionId,
      record: {
        status: 'Completed',
        durationMinutes: input.durationMinutes,
        totalExercises: input.totalExercises,
        totalSets: input.totalSets,
        totalReps: input.totalReps,
        caloriesBurned: input.caloriesBurned,
        completion: input.completion / 100,
      }
    });
    
    // Check achievements
    const { records: sessions } = await zite.workoutSessions.findAll({ 
      filters: { user: context.user.id, status: 'Completed' }, limit: 500 
    });
    const count = sessions.length;
    const totalCals = sessions.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    
    const achievementDefs = [
      { key: 'first_workout', name: 'First Workout', desc: 'Complete your first workout', icon: '🎯', check: count >= 1 },
      { key: '10_workouts', name: '10 Workouts', desc: 'Complete 10 workouts', icon: '💪', check: count >= 10 },
      { key: '50_workouts', name: '50 Workouts', desc: 'Complete 50 workouts', icon: '🔥', check: count >= 50 },
      { key: '100_workouts', name: '100 Workouts', desc: 'Complete 100 workouts', icon: '🏆', check: count >= 100 },
      { key: '1000_calories', name: '1,000 Calories', desc: 'Burn 1,000 total calories', icon: '🔥', check: totalCals >= 1000 },
    ];

    const { records: existing } = await zite.userAchievements.findAll({ filters: { user: context.user.id }, limit: 500 });
    const existingKeys = new Set(existing.map(a => a.achievementKey));
    
    const newAchievements = achievementDefs.filter(a => a.check && !existingKeys.has(a.key));
    if (newAchievements.length > 0) {
      await zite.userAchievements.bulkCreate({
        records: newAchievements.map(a => ({
          achievementKey: a.key,
          user: context.user.id,
          name: a.name,
          description: a.desc,
          icon: a.icon,
          unlockedDate: new Date().toISOString().split('T')[0],
        }))
      });
    }

    // Check streak achievement
    const dates = sessions.map(s => s.date).filter(Boolean).sort().reverse();
    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    for (const d of uniqueDates) {
      if (d === checkDate) { streak++; const prev = new Date(checkDate); prev.setDate(prev.getDate() - 1); checkDate = prev.toISOString().split('T')[0]; }
      else if (d === checkDate) { streak++; }
      else break;
    }
    if (streak >= 7 && !existingKeys.has('7_day_streak')) {
      await zite.userAchievements.create({
        record: { achievementKey: '7_day_streak', user: context.user.id, name: '7-Day Streak', description: 'Work out 7 days in a row', icon: '🔥', unlockedDate: new Date().toISOString().split('T')[0] }
      });
    }

    return { success: true };
  },
});
