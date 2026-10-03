import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets progress data for charts',
  authenticated: true,
  inputSchema: z.object({ days: z.number().optional() }),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ context, input }) => {
    const uid = context.user.id;
    const daysBack = input.days || 30;
    const cutoff = new Date(Date.now() - daysBack * 86400000).toISOString().split('T')[0];

    const { records: sessions } = await zite.workoutSessions.findAll({ filters: { user: uid }, limit: 500 });
    const filtered = sessions.filter(s => s.date && s.date >= cutoff);

    const { records: bmiRecords } = await zite.bmiRecords.findAll({ filters: { user: uid }, limit: 200 });
    const bmiFiltered = bmiRecords.filter(b => b.date && b.date >= cutoff);

    const { records: measurements } = await zite.bodyMeasurements.findAll({ filters: { user: uid }, limit: 200 });
    const measFiltered = measurements.filter(m => m.date && m.date >= cutoff);

    return {
      data: {
        sessions: filtered,
        bmiRecords: bmiFiltered,
        measurements: measFiltered,
      }
    };
  },
});
