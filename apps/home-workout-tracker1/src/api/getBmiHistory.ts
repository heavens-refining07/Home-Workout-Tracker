import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets BMI history for the user',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ records: z.any() }),
  execute: async ({ context }) => {
    const { records } = await zite.bmiRecords.findAll({ filters: { user: context.user.id }, limit: 100 });
    return { records };
  },
});
