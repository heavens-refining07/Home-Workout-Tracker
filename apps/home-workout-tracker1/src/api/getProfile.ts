import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets the user profile, creating one if needed',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ profile: z.any() }),
  execute: async ({ context }) => {
    let profile = await zite.profiles.findOne({ filters: { user: context.user.id } });
    if (!profile) {
      profile = await zite.profiles.create({
        record: {
          displayName: context.user.firstName ? `${context.user.firstName} ${context.user.lastName || ''}`.trim() : context.user.email.split('@')[0],
          user: context.user.id,
          role: 'User',
          age: null, gender: null, height: null, weight: null,
          fitnessLevel: 'Beginner', fitnessGoal: 'General Fitness', avatar: null,
        }
      });
    }
    return { profile };
  },
});
