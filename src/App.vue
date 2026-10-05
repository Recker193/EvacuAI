<script setup lang="ts">
import FloorPlan from '@/components/FloorPlan.vue'
import UploadPanel from '@/components/UploadPanel.vue'
</script>

<template>
  <main class="min-h-screen bg-slate-950 p-8 text-white">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8">
        <p
          class="mb-2 text-sm font-medium uppercase tracking-widest text-red-400"
        >
          Emergency simulation
        </p>

        <h1 class="text-4xl font-bold">
          EvacuAI
        </h1>

        <p class="mt-2 text-slate-400">
          Analyze buildings and simulate safe evacuation routes.
        </p>
      </div>

      <div class="space-y-6">
        <UploadPanel />

        <FloorPlan />
      </div>
    </div>
  </main>
</template>