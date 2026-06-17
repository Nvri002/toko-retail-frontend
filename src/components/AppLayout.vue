<template>
  <div class="flex min-h-screen bg-canvas-cream">
    <AppSidebar />
    <div class="flex flex-col flex-1 min-w-0" style="margin-left: 240px;">
      <AppHeader />
      <main class="flex-1 p-xxl">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader  from './AppHeader.vue'
</script>
