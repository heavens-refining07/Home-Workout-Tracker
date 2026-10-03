import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Updates the user profile',
  authenticated: true,
  inputSchema: z.object({
    displayName: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    fitnessLevel: z.string().optional(),
    fitnessGoal: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    const profile = await zite.profiles.findOne({ filters: { user: context.user.id } });
    if (!profile) throw new Error('Profile not found');
    await zite.profiles.update({ id: profile.id, record: input as any });
    return { success: true };
  },
});
