import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MerkleMapIncludeSchema } from '../inputTypeSchemas/MerkleMapIncludeSchema'
import { MerkleMapWhereInputSchema } from '../inputTypeSchemas/MerkleMapWhereInputSchema'
import { MerkleMapOrderByWithRelationInputSchema } from '../inputTypeSchemas/MerkleMapOrderByWithRelationInputSchema'
import { MerkleMapWhereUniqueInputSchema } from '../inputTypeSchemas/MerkleMapWhereUniqueInputSchema'
import { MerkleMapScalarFieldEnumSchema } from '../inputTypeSchemas/MerkleMapScalarFieldEnumSchema'
import { MerkleMapLeafFindManyArgsSchema } from "../outputTypeSchemas/MerkleMapLeafFindManyArgsSchema"
import { MerkleMapCountOutputTypeArgsSchema } from "../outputTypeSchemas/MerkleMapCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MerkleMapSelectSchema: z.ZodType<Prisma.MerkleMapSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  root: z.boolean().optional(),
  size: z.boolean().optional(),
  height: z.boolean().optional(),
  createdUtc: z.boolean().optional(),
  updatedUtc: z.boolean().optional(),
  leafs: z.union([z.boolean(),z.lazy(() => MerkleMapLeafFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MerkleMapCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const MerkleMapFindFirstArgsSchema: z.ZodType<Prisma.MerkleMapFindFirstArgs> = z.object({
  select: MerkleMapSelectSchema.optional(),
  include: MerkleMapIncludeSchema.optional(),
  where: MerkleMapWhereInputSchema.optional(),
  orderBy: z.union([ MerkleMapOrderByWithRelationInputSchema.array(),MerkleMapOrderByWithRelationInputSchema ]).optional(),
  cursor: MerkleMapWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MerkleMapScalarFieldEnumSchema,MerkleMapScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export default MerkleMapFindFirstArgsSchema;
