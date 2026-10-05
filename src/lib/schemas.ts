import { z } from 'zod'

export const pointSchema = z.object({
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(1000),
})

export const roomSchema = z.object({
  id: z.string().min(1),

  name: z.string().min(1),

  kind: z.enum([
    'room',
    'corridor',
    'hall',
    'stairwell',
    'other',
  ]),

  polygon: z
    .array(pointSchema)
    .min(3),

  connections: z.array(
    z.string().min(1),
  ),
})

export const exitSchema = z.object({
  id: z.string().min(1),

  name: z.string().min(1),

  position: pointSchema,
})

export const doorSchema = z.object({
  id: z.string().min(1),

  position: pointSchema,

  connects: z
    .array(z.string().min(1))
    .length(2),
})

export const floorPlanSchema = z.object({
  width: z.literal(1000),

  height: z.literal(1000),

  rooms: z.array(roomSchema),

  exits: z.array(exitSchema),

  doors: z.array(doorSchema),
})