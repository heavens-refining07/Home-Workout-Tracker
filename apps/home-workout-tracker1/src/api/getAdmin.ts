import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets admin dashboard data (admin only)',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ context }) => {
    const profile = await zite.profiles.findOne({ filters: { user: context.user.id } });
    if (profile?.role !== 'Admin') throw new Error('Unauthorized: Admin access required');

    const users = await zite.auth.findAllUsers({ limit: 500 });
    const { records: allSessions } = await zite.workoutSessions.findAll({ limit: 500 });
    const { records: allExercises } = await zite.exercises.findAll({ limit: 500 });
    const { records: allProfiles } = await zite.profiles.findAll({ limit: 500 });
    
    const completed = allSessions.filter(s => s.status === 'Completed');
    const totalCalories = completed.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const avgDuration = completed.length > 0 ? Math.round(completed.reduce((s, w) => s + (w.durationMinutes || 0), 0) / completed.length) : 0;

    return {
      data: {
        totalUsers: users.total,
        activeUsers: allProfiles.length,
        totalWorkouts: allSessions.length,
        completedWorkouts: completed.length,
        totalExercises: allExercises.length,
        totalCalories,
        avgDuration,
        users: users.records,
        profiles: allProfiles,
        exercises: allExercises,
      }
    };
  },
});
