import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets user achievements',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ achievements: z.any() }),
  execute: async ({ context }) => {
    const { records } = await zite.userAchievements.findAll({ filters: { user: context.user.id }, limit: 100 });
    return { achievements: records };
  },
});
