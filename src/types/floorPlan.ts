export interface Point {
  x: number
  y: number
}

export interface Room {
  id: string
  name: string
  polygon: Point[]
  connections: string[]
}

export interface Exit {
  id: string
  name: string
  position: Point
}

export interface Door {
  id: string
  position: Point
  connects: [string, string]
}

export interface FloorPlan {
  width: number
  height: number
  rooms: Room[]
  exits: Exit[]
  doors: Door[]
}