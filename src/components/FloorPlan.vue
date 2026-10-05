<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  buildGraph,
  findShortestPath,
  type GraphNode,
} from '@/lib/evacuation'

const rooms = [
  {
    id: 'class-a',
    name: 'Classroom A',
    x: 50,
    y: 50,
    width: 250,
    height: 170,
  },
  {
    id: 'class-b',
    name: 'Classroom B',
    x: 50,
    y: 280,
    width: 250,
    height: 170,
  },
  {
    id: 'lab',
    name: 'Science Lab',
    x: 650,
    y: 50,
    width: 300,
    height: 170,
  },
]

const exits = [
  {
    id: 'exit-a',
    name: 'Exit A',
    x: 950,
    y: 350,
  },
  {
    id: 'exit-b',
    name: 'Exit B',
    x: 50,
    y: 600,
  },
]

const nodes: GraphNode[] = [
  {
    id: 'class-a',
    x: 175,
    y: 135,
  },
  {
    id: 'class-b',
    x: 175,
    y: 365,
  },
  {
    id: 'lab',
    x: 800,
    y: 135,
  },
  {
    id: 'corridor-top',
    x: 475,
    y: 260,
  },
  {
    id: 'corridor-bottom',
    x: 475,
    y: 420,
  },
  {
    id: 'exit-a',
    x: 950,
    y: 350,
  },
  {
    id: 'exit-b',
    x: 50,
    y: 600,
  },
]

const graph = buildGraph(nodes)

/*
 * Sets let us have multiple simultaneous fires
 * and multiple blocked exits.
 */
const burningRooms = ref<Set<string>>(new Set())
const blockedExits = ref<Set<string>>(new Set())

function setFire(roomId: string) {
  const next = new Set(burningRooms.value)

  if (next.has(roomId)) {
    next.delete(roomId)
  } else {
    next.add(roomId)
  }

  burningRooms.value = next
}

function toggleExit(exitId: string) {
  const next = new Set(blockedExits.value)

  if (next.has(exitId)) {
    next.delete(exitId)
  } else {
    next.add(exitId)
  }

  blockedExits.value = next
}

function resetSimulation() {
  burningRooms.value = new Set()
  blockedExits.value = new Set()
}

/*
 * Find the evacuation routes for every room that
 * is not currently on fire.
 */
const evacuationRoutes = computed(() => {
  if (
    burningRooms.value.size === 0 &&
    blockedExits.value.size === 0
  ) {
    return []
  }

  const blockedNodes = new Set<string>()

  // Every burning room becomes inaccessible.
  for (const roomId of burningRooms.value) {
    blockedNodes.add(roomId)
  }

  // Every blocked exit becomes inaccessible.
  for (const exitId of blockedExits.value) {
    blockedNodes.add(exitId)
  }

  const routes: {
    roomId: string
    roomName: string
    path: string[]
  }[] = []

  for (const room of rooms) {
    // People in a burning room don't get an evacuation
    // route calculated from that room.
    if (burningRooms.value.has(room.id)) {
      continue
    }

    const path = findShortestPath(
      graph,
      room.id,
      blockedNodes,
    )

    if (path.length > 0) {
      routes.push({
        roomId: room.id,
        roomName: room.name,
        path,
      })
    }
  }

  return routes
})

function getPathPoints(path: string[]): string {
  return path
    .map((nodeId) => {
      const node = nodes.find(
        (item) => item.id === nodeId,
      )

      if (!node) {
        return ''
      }

      return `${node.x},${node.y}`
    })
    .filter(Boolean)
    .join(' ')
  }
</script>

<template>
  <div class="space-y-4">
    <!-- Status bar -->
    <div
      class="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm text-slate-400">
          Simulation status
        </p>

        <!-- Safe -->
        <p
          v-if="burningRooms.size === 0"
          class="font-semibold text-green-400"
        >
          ● Building safe
        </p>

        <!-- One or more fires -->
        <div
          v-else
          class="font-semibold text-red-400"
        >
          <p>
            🔥
            {{ burningRooms.size }}
            active
            {{ burningRooms.size === 1 ? 'fire' : 'fires' }}
          </p>

          <p class="mt-1 text-sm font-normal text-red-300">
            {{
              rooms
                .filter((room) =>
                  burningRooms.has(room.id),
                )
                .map((room) => room.name)
                .join(', ')
            }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Fire count -->
        <p
          v-if="burningRooms.size > 0"
          class="text-sm text-red-300"
        >
          🔥 {{ burningRooms.size }}
        </p>

        <!-- Blocked exit count -->
        <p
          v-if="blockedExits.size > 0"
          class="text-sm text-red-300"
        >
          🚫 {{ blockedExits.size }}
        </p>

        <!-- Route count -->
        <p
          v-if="evacuationRoutes.length > 0"
          class="text-sm text-slate-400"
        >
          {{ evacuationRoutes.length }}
          safe
          {{ evacuationRoutes.length === 1 ? 'route' : 'routes' }}
        </p>

        <button
          class="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
          @click="resetSimulation"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Floor plan -->
    <div
      class="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-4"
    >
      <svg
        viewBox="0 0 1000 700"
        class="h-auto w-full"
      >
        <!-- Background -->
        <rect
          x="0"
          y="0"
          width="1000"
          height="700"
          fill="#0f172a"
        />

        <!-- Corridor -->
        <rect
          x="300"
          y="180"
          width="350"
          height="320"
          fill="#1e293b"
          stroke="#64748b"
          stroke-width="4"
        />

        <!-- Corridor center line -->
        <line
          x1="300"
          y1="340"
          x2="650"
          y2="340"
          stroke="#475569"
          stroke-width="2"
          stroke-dasharray="10 10"
        />

        <!-- Evacuation routes -->
        <g
          v-for="route in evacuationRoutes"
          :key="route.roomId"
        >
          <!-- Glow -->
          <polyline
            :points="getPathPoints(route.path)"
            fill="none"
            stroke="#38bdf8"
            stroke-width="18"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.12"
          />

          <!-- Animated route -->
          <polyline
            :points="getPathPoints(route.path)"
            fill="none"
            stroke="#38bdf8"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="18 10"
            class="evacuation-route"
          />

          <!-- Starting point -->
          <circle
            :cx="
              nodes.find(
                (node) => node.id === route.roomId,
              )?.x
            "
            :cy="
              nodes.find(
                (node) => node.id === route.roomId,
              )?.y
            "
            r="9"
            fill="#38bdf8"
          />
        </g>

        <!-- Rooms -->
        <g
          v-for="room in rooms"
          :key="room.id"
          class="cursor-pointer"
          @click="setFire(room.id)"
        >
          <rect
            :x="room.x"
            :y="room.y"
            :width="room.width"
            :height="room.height"
            :fill="
              burningRooms.has(room.id)
                ? '#7f1d1d'
                : '#334155'
            "
            :stroke="
              burningRooms.has(room.id)
                ? '#ef4444'
                : '#94a3b8'
            "
            :stroke-width="
              burningRooms.has(room.id)
                ? 8
                : 4
            "
            rx="6"
          />

          <!-- Fire indicator -->
          <text
            v-if="burningRooms.has(room.id)"
            :x="room.x + room.width / 2"
            :y="room.y + 42"
            text-anchor="middle"
            font-size="32"
          >
            🔥
          </text>

          <!-- Evacuate label -->
          <text
            v-if="
              evacuationRoutes.some(
                (route) =>
                  route.roomId === room.id,
              )
            "
            :x="room.x + room.width / 2"
            :y="room.y + room.height / 2 - 18"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#38bdf8"
            font-size="16"
            font-weight="700"
          >
            EVACUATE
          </text>

          <!-- Room name -->
          <text
            :x="room.x + room.width / 2"
            :y="
              room.y +
              room.height / 2 +
              (
                evacuationRoutes.some(
                  (route) =>
                    route.roomId === room.id,
                )
                  ? 18
                  : 0
              )
            "
            text-anchor="middle"
            dominant-baseline="middle"
            fill="white"
            font-size="24"
            font-weight="600"
          >
            {{ room.name }}
          </text>
        </g>

        <!-- Exits -->
        <g
          v-for="exit in exits"
          :key="exit.id"
          class="cursor-pointer"
          @click="toggleExit(exit.id)"
        >
          <!-- Exit glow -->
          <circle
            :cx="exit.x"
            :cy="exit.y"
            r="42"
            :fill="
              blockedExits.has(exit.id)
                ? '#ef4444'
                : '#22c55e'
            "
            opacity="0.12"
          />

          <!-- Exit -->
          <circle
            :cx="exit.x"
            :cy="exit.y"
            r="28"
            :fill="
              blockedExits.has(exit.id)
                ? '#7f1d1d'
                : '#22c55e'
            "
            :stroke="
              blockedExits.has(exit.id)
                ? '#ef4444'
                : '#86efac'
            "
            stroke-width="5"
          />

          <!-- Exit icon -->
          <text
            :x="exit.x"
            :y="exit.y + 8"
            text-anchor="middle"
            font-size="24"
          >
            {{ blockedExits.has(exit.id) ? '✕' : '→' }}
          </text>

          <!-- Exit name -->
          <text
            :x="exit.x"
            :y="exit.y + 55"
            text-anchor="middle"
            fill="white"
            font-size="20"
            font-weight="600"
          >
            {{ exit.name }}
          </text>

          <!-- Blocked label -->
          <text
            v-if="blockedExits.has(exit.id)"
            :x="exit.x"
            :y="exit.y + 82"
            text-anchor="middle"
            fill="#f87171"
            font-size="16"
            font-weight="700"
          >
            BLOCKED
          </text>
        </g>
      </svg>
    </div>

    <!-- Analysis -->
    <div
      class="rounded-xl border border-slate-700 bg-slate-900 p-4"
    >
      <div
        v-if="
          burningRooms.size > 0 ||
          blockedExits.size > 0
        "
        class="space-y-2 text-sm"
      >
        <p class="font-semibold text-white">
          Evacuation analysis
        </p>

        <p
          v-if="evacuationRoutes.length > 0"
          class="text-slate-400"
        >
          {{
            evacuationRoutes.length
          }}
          safe
          {{
            evacuationRoutes.length === 1
              ? 'route has'
              : 'routes have'
          }}
          been calculated and displayed in blue.
        </p>

        <p
          v-else
          class="font-medium text-red-400"
        >
          ⚠ No safe evacuation route found.
        </p>
      </div>

      <p
        v-else
        class="text-sm text-slate-300"
      >
        Click any room to simulate a fire.
        Click any exit to block it.
      </p>
    </div>
  </div>
</template>

<style scoped>
.evacuation-route {
  animation: routeFlow 0.8s linear infinite;
}

@keyframes routeFlow {
  to {
    stroke-dashoffset: -28;
  }
}
</style>