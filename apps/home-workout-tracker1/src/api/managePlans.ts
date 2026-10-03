import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'CRUD for workout plans',
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'create', 'delete']),
    id: z.string().optional(),
    name: z.string().optional(),
    goal: z.string().optional(),
    fitnessLevel: z.string().optional(),
    durationMinutes: z.number().optional(),
    equipment: z.string().optional(),
    daysPerWeek: z.number().optional(),
    description: z.string().optional(),
  }),
  outputSchema: z.object({ plans: z.any() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    if (input.action === 'create') {
      await zite.workoutPlans.create({
        record: {
          name: input.name || 'My Plan',
          user: uid,
          goal: input.goal || 'General Fitness',
          fitnessLevel: input.fitnessLevel || 'Beginner',
          durationMinutes: input.durationMinutes ?? 30,
          equipment: input.equipment || 'No Equipment',
          daysPerWeek: input.daysPerWeek ?? 3,
          description: input.description || '',
          active: true,
          planExercises: null, workoutSessions: null,
        }
      });
    }
    if (input.action === 'delete' && input.id) {
      await zite.workoutPlans.delete({ id: input.id });
    }
    const { records } = await zite.workoutPlans.findAll({ filters: { user: uid }, limit: 50 });
    return { plans: records };
  },
});
