import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Admin: creates or deletes an exercise',
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['create', 'update', 'delete']),
    id: z.string().optional(),
    name: z.string().optional(),
    category: z.string().optional(),
    muscleGroup: z.string().optional(),
    difficulty: z.string().optional(),
    equipment: z.string().optional(),
    instructions: z.string().optional(),
    videoUrl: z.string().url().or(z.literal('')).optional(),
    steps: z.string().optional(),
    defaultSets: z.number().optional(),
    defaultReps: z.number().optional(),
    defaultDuration: z.number().optional(),
    restTime: z.number().optional(),
    caloriesPerSet: z.number().optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    const profile = await zite.profiles.findOne({ filters: { user: context.user.id } });
    if (profile?.role !== 'Admin') throw new Error('Unauthorized');

    if (input.action === 'create') {
      await zite.exercises.create({
        record: {
          name: input.name || 'New Exercise',
          category: input.category || null,
          muscleGroup: input.muscleGroup || null,
          difficulty: input.difficulty || 'Beginner',
          equipment: input.equipment || 'No Equipment',
          instructions: input.instructions || null,
          steps: input.steps || null,
          defaultSets: input.defaultSets ?? 3,
          defaultReps: input.defaultReps ?? 10,
          defaultDuration: input.defaultDuration ?? 30,
          restTime: input.restTime ?? 60,
          caloriesPerSet: input.caloriesPerSet ?? 5,
          videoUrl: input.videoUrl || null, image: null,
          planExercises: null, exerciseLogs: null, favoriteExercises: null,
        }
      });
    }
    if (input.action === 'update' && input.id) {
      const { action, id, ...fields } = input;
      await zite.exercises.update({ id, record: fields as any });
    }
    if (input.action === 'delete' && input.id) {
      await zite.exercises.delete({ id: input.id });
    }
    return { success: true };
  },
});
