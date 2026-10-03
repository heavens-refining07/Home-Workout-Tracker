import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets body measurement history',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ records: z.any() }),
  execute: async ({ context }) => {
    const { records } = await zite.bodyMeasurements.findAll({ filters: { user: context.user.id }, limit: 200 });
    return { records };
  },
});
