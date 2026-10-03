import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets workout history for the user',
  authenticated: true,
  inputSchema: z.object({ search: z.string().optional() }),
  outputSchema: z.object({ sessions: z.any() }),
  execute: async ({ input, context }) => {
    const filters: any = { user: context.user.id };
    if (input.search) filters.title = { contains: input.search };
    const { records } = await zite.workoutSessions.findAll({ filters, limit: 200 });
    return { sessions: records };
  },
});
