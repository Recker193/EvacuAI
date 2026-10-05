import type { FloorPlan } from '@/types/floorPlan'

export const demoFloorPlan: FloorPlan = {
  width: 1000,
  height: 700,

  rooms: [
    {
      id: 'class-a',
      name: 'Classroom A',
      polygon: [
        { x: 50, y: 50 },
        { x: 300, y: 50 },
        { x: 300, y: 220 },
        { x: 50, y: 220 }
      ],
      connections: ['corridor']
    },
    {
      id: 'class-b',
      name: 'Classroom B',
      polygon: [
        { x: 50, y: 280 },
        { x: 300, y: 280 },
        { x: 300, y: 450 },
        { x: 50, y: 450 }
      ],
      connections: ['corridor']
    },
    {
      id: 'lab',
      name: 'Science Lab',
      polygon: [
        { x: 650, y: 50 },
        { x: 950, y: 50 },
        { x: 950, y: 220 },
        { x: 650, y: 220 }
      ],
      connections: ['corridor']
    },
    {
      id: 'corridor',
      name: 'Main Corridor',
      polygon: [
        { x: 300, y: 180 },
        { x: 650, y: 180 },
        { x: 650, y: 500 },
        { x: 300, y: 500 }
      ],
      connections: ['class-a', 'class-b', 'lab', 'exit-a', 'exit-b']
    }
  ],

  exits: [
    {
      id: 'exit-a',
      name: 'Exit A',
      position: { x: 950, y: 350 }
    },
    {
      id: 'exit-b',
      name: 'Exit B',
      position: { x: 50, y: 600 }
    }
  ],

  doors: []
}