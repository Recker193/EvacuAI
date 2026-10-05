export interface GraphNode {
  id: string
  x: number
  y: number
}

export interface GraphEdge {
  to: string
  distance: number
}

export interface Graph {
  [nodeId: string]: GraphEdge[]
}

interface QueueItem {
  id: string
  distance: number
}

function getDistance(a: GraphNode, b: GraphNode): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  )
}

export function buildGraph(nodes: GraphNode[]): Graph {
  const graph: Graph = {}

  for (const node of nodes) {
    graph[node.id] = []
  }

  function connect(a: string, b: string) {
    const nodeA = nodes.find(node => node.id === a)
    const nodeB = nodes.find(node => node.id === b)

    if (!nodeA || !nodeB) return

    const distance = getDistance(nodeA, nodeB)

    graph[a].push({
      to: b,
      distance,
    })

    graph[b].push({
      to: a,
      distance,
    })
  }

  connect('class-a', 'corridor-top')
  connect('class-b', 'corridor-bottom')
  connect('lab', 'corridor-top')
  connect('corridor-top', 'corridor-bottom')
  connect('corridor-bottom', 'exit-b')
  connect('corridor-top', 'exit-a')

  return graph
}

export function findShortestPath(
  graph: Graph,
  start: string,
  blockedNodes: Set<string>
): string[] {
  if (blockedNodes.has(start)) {
    return []
  }

  const distances: Record<string, number> = {}
  const previous: Record<string, string | undefined> = {}
  const visited = new Set<string>()

  for (const nodeId of Object.keys(graph)) {
    distances[nodeId] = Infinity
  }

  distances[start] = 0

  while (visited.size < Object.keys(graph).length) {
    let current: QueueItem | null = null

    for (const nodeId of Object.keys(graph)) {
      if (visited.has(nodeId) || blockedNodes.has(nodeId)) {
        continue
      }

      if (
        current === null ||
        distances[nodeId] < current.distance
      ) {
        current = {
          id: nodeId,
          distance: distances[nodeId],
        }
      }
    }

    if (current === null || current.distance === Infinity) {
      break
    }

    visited.add(current.id)

    for (const edge of graph[current.id]) {
      if (
        visited.has(edge.to) ||
        blockedNodes.has(edge.to)
      ) {
        continue
      }

      const newDistance =
        current.distance + edge.distance

      if (newDistance < distances[edge.to]) {
        distances[edge.to] = newDistance
        previous[edge.to] = current.id
      }
    }
  }

  let bestExit: string | null = null
  let bestDistance = Infinity

  for (const exitId of ['exit-a', 'exit-b']) {
    if (
      !blockedNodes.has(exitId) &&
      distances[exitId] < bestDistance
    ) {
      bestExit = exitId
      bestDistance = distances[exitId]
    }
  }

  if (!bestExit || bestDistance === Infinity) {
    return []
  }

  const path: string[] = []
  let current: string | undefined = bestExit

  while (current) {
    path.unshift(current)
    current = previous[current]
  }

  return path
}