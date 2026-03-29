import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  service_name: z.string().min(1, { message: 'Service name is required' }),
  trial_start: z.string().min(1, { message: 'Trial start date is required' }),
  trial_end: z.string().min(1, { message: 'Trial end date is required' }),
  price_after_trial: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .nonnegative({ message: 'Price cannot be negative' })
    .optional(),
});