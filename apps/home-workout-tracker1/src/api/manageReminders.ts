import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'CRUD for workout reminders',
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'create', 'update', 'delete']),
    id: z.string().optional(),
    title: z.string().optional(),
    time: z.string().optional(),
    days: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
  outputSchema: z.object({ reminders: z.any() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    if (input.action === 'list') {
      const { records } = await zite.reminders.findAll({ filters: { user: uid }, limit: 50 });
      return { reminders: records };
    }
    if (input.action === 'create') {
      await zite.reminders.create({
        record: { title: input.title || 'Workout Reminder', user: uid, time: input.time || '08:00', days: input.days as any || null, active: true }
      });
    }
    if (input.action === 'update' && input.id) {
      await zite.reminders.update({ id: input.id, record: { active: input.active } as any });
    }
    if (input.action === 'delete' && input.id) {
      await zite.reminders.delete({ id: input.id });
    }
    const { records } = await zite.reminders.findAll({ filters: { user: uid }, limit: 50 });
    return { reminders: records };
  },
});
