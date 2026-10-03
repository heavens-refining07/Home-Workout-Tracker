import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Logs a completed exercise set in a workout session',
  authenticated: true,
  inputSchema: z.object({
    sessionId: z.string(),
    exerciseId: z.string(),
    setNumber: z.number(),
    reps: z.number(),
    weight: z.number().optional(),
    durationSeconds: z.number().optional(),
    calories: z.number().optional(),
  }),
  outputSchema: z.object({ log: z.any() }),
  execute: async ({ input, context }) => {
    const log = await zite.exerciseLogs.create({
      record: {
        label: `Set ${input.setNumber}`,
        session: input.sessionId,
        exercise: input.exerciseId,
        user: context.user.id,
        setNumber: input.setNumber,
        reps: input.reps,
        weight: input.weight ?? 0,
        durationSeconds: input.durationSeconds ?? 0,
        restSeconds: 0,
        calories: input.calories ?? 0,
        completed: true,
      }
    });
    return { log };
  },
});
