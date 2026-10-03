import type { z } from 'zod';
export function createEndpoint<I extends z.ZodTypeAny, O extends z.ZodTypeAny>(config: {
  description: string; authenticated: boolean; inputSchema: I; outputSchema: O;
  execute: (args: { input: z.infer<I>; context: { user: { id: string; email: string; firstName?: string; lastName?: string } } }) => Promise<z.infer<O>>;
}) { return config; }
