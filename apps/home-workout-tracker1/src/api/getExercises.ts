import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists exercises with optional filters',
  authenticated: true,
  inputSchema: z.object({
    category: z.string().optional(),
    difficulty: z.string().optional(),
    equipment: z.string().optional(),
    search: z.string().optional(),
  }),
  outputSchema: z.object({ exercises: z.any() }),
  execute: async ({ input, context }) => {
    const filters: any = {};
    if (input.category) filters.category = input.category;
    if (input.difficulty) filters.difficulty = input.difficulty;
    if (input.equipment) filters.equipment = input.equipment;
    if (input.search) filters.name = { contains: input.search };

    const { records } = await zite.exercises.findAll({ filters, limit: 200 });

    // Get user favorites
    const { records: favs } = await zite.favoriteExercises.findAll({ filters: { user: context.user.id }, limit: 500 });
    const favExIds = new Set(favs.map(f => {
      const ex = f.exercise;
      return Array.isArray(ex) ? ex[0] : ex;
    }));

    const exercises = records.map(e => ({
      ...e,
      isFavorite: favExIds.has(e.id),
      favRecordId: favs.find(f => {
        const ex = f.exercise;
        return (Array.isArray(ex) ? ex[0] : ex) === e.id;
      })?.id,
    }));

    return { exercises };
  },
});
