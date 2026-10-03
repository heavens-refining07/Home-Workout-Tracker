import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Saves a body measurement record',
  authenticated: true,
  inputSchema: z.object({
    weight: z.number().optional(),
    chest: z.number().optional(),
    waist: z.number().optional(),
    arms: z.number().optional(),
    hips: z.number().optional(),
    thighs: z.number().optional(),
  }),
  outputSchema: z.object({ record: z.any() }),
  execute: async ({ input, context }) => {
    const record = await zite.bodyMeasurements.create({
      record: {
        date: new Date().toISOString().split('T')[0],
        user: context.user.id,
        weight: input.weight ?? null,
        chest: input.chest ?? null,
        waist: input.waist ?? null,
        arms: input.arms ?? null,
        hips: input.hips ?? null,
        thighs: input.thighs ?? null,
      }
    });
    return { record };
  },
});
