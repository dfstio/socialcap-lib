import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';

export const MembersUncheckedUpdateManyWithoutCommunityInputSchema: z.ZodType<Prisma.MembersUncheckedUpdateManyWithoutCommunityInput> = z.object({
  personUid: z.union([ z.string().max(32),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string().max(32),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdUtc: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  approvedUtc: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export default MembersUncheckedUpdateManyWithoutCommunityInputSchema;
