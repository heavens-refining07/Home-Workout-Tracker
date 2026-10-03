import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'CRUD for fitness goals',
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'create', 'update', 'delete']),
    id: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
    unit: z.string().optional(),
    deadline: z.string().optional(),
    status: z.string().optional(),
  }),
  outputSchema: z.object({ goals: z.any(), goal: z.any().optional() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    if (input.action === 'list') {
      const { records } = await zite.fitnessGoals.findAll({ filters: { user: uid }, limit: 100 });
      return { goals: records };
    }
    if (input.action === 'create') {
      const goal = await zite.fitnessGoals.create({
        record: {
          name: input.name || 'New Goal',
          user: uid,
          type: input.type || 'Custom',
          targetValue: input.targetValue ?? 0,
          currentValue: input.currentValue ?? 0,
          unit: input.unit || '',
          deadline: input.deadline || null,
          status: 'Active',
        }
      });
      return { goals: [], goal };
    }
    if (input.action === 'update' && input.id) {
      await zite.fitnessGoals.update({ id: input.id, record: { currentValue: input.currentValue, status: input.status } as any });
      return { goals: [] };
    }
    if (input.action === 'delete' && input.id) {
      await zite.fitnessGoals.delete({ id: input.id });
      return { goals: [] };
    }
    return { goals: [] };
  },
});
