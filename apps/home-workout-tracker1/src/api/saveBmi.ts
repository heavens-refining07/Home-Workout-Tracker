import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Saves a BMI record for the user',
  authenticated: true,
  inputSchema: z.object({ weight: z.number().positive().max(1000), height: z.number().positive().max(300) }),
  outputSchema: z.object({ record: z.any() }),
  execute: async ({ input, context }) => {
    const heightM = input.height / 100;
    const bmi = input.weight / (heightM * heightM);
    let cat = 'Normal';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
    else if (bmi >= 30) cat = 'Obese';

    const record = await zite.bmiRecords.create({
      record: {
        date: new Date().toISOString().split('T')[0],
        user: context.user.id,
        weight: input.weight,
        height: input.height,
        bmiValue: Math.round(bmi * 10) / 10,
        category: cat,
      }
    });
    return { record };
  },
});
