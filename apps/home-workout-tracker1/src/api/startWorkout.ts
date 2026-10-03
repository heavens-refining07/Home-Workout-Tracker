import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Creates a new workout session',
  authenticated: true,
  inputSchema: z.object({
    title: z.string(),
    planId: z.string().optional(),
  }),
  outputSchema: z.object({ session: z.any() }),
  execute: async ({ input, context }) => {
    const session = await zite.workoutSessions.create({
      record: {
        title: input.title,
        user: context.user.id,
        plan: input.planId || null,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 0,
        status: 'In Progress',
        caloriesBurned: 0,
        totalExercises: 0,
        totalSets: 0,
        totalReps: 0,
        completion: 0,
        notes: null,
        exerciseLogs: null,
      }
    });
    return { session };
  },
});
