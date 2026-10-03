import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Toggles favorite status for an exercise',
  authenticated: true,
  inputSchema: z.object({ exerciseId: z.string(), favRecordId: z.string().optional() }),
  outputSchema: z.object({ isFavorite: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.favRecordId) {
      await zite.favoriteExercises.delete({ id: input.favRecordId });
      return { isFavorite: false };
    }
    await zite.favoriteExercises.create({
      record: { label: 'fav', user: context.user.id, exercise: input.exerciseId }
    });
    return { isFavorite: true };
  },
});
