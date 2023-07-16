import type { Prisma } from '@prisma/client';
import { z } from 'zod';

export const CommunityUncheckedCreateWithoutMembersInputSchema: z.ZodType<Prisma.CommunityUncheckedCreateWithoutMembersInput> = z.object({
  uid: z.string().max(32),
  accountId: z.string().max(32).optional().nullable(),
  adminUid: z.string().max(32),
  state: z.string().min(1).max(12),
  name: z.string().min(3).max(128),
  description: z.string().max(128).optional().nullable(),
  image: z.string().url().max(128).optional().nullable(),
  createdUtc: z.coerce.date().optional(),
  updatedUtc: z.coerce.date().optional(),
  approvedUtc: z.coerce.date()
}).strict();

export default CommunityUncheckedCreateWithoutMembersInputSchema;
