<script setup lang="ts">
import FloorPlan from '@/components/FloorPlan.vue'
</script>

<template>
  <main class="min-h-screen bg-slate-950 p-8 text-white">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8">
        <p class="mb-2 text-sm font-medium uppercase tracking-widest text-red-400">
          Emergency simulation
        </p>

        <h1 class="text-4xl font-bold tracking-tight">
          EvacuAI
        </h1>

        <p class="mt-2 max-w-2xl text-slate-400">
          Simulate emergencies and determine safe evacuation routes.
        </p>
      </div>

      <FloorPlan />
    </div>
  </main>
</template>