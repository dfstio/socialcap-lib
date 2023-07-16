import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  uid: z.lazy(() => SortOrderSchema).optional(),
  otp: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  createdUtc: z.lazy(() => SortOrderSchema).optional(),
  updatedUtc: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default SessionCountOrderByAggregateInputSchema;
