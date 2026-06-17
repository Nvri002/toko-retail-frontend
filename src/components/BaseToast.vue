<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible"
           class="fixed bottom-xxl right-xxl z-50 flex items-center gap-sm px-xl py-md rounded-pill shadow-elev-4"
           :class="type === 'success' ? 'bg-ink text-white' : 'bg-red-500 text-white'"
           style="min-width:240px;max-width:360px;">
        <span style="font-size:16px;">{{ type === 'success' ? '✓' : '✕' }}</span>
        <span class="font-body text-body-md flex-1">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type    = ref('success')
let timer = null

function show(msg, t = 'success') {
  clearTimeout(timer)
  message.value = msg
  type.value    = t
  visible.value = true
  timer = setTimeout(() => { visible.value = false }, 3000)
}

defineExpose({ show })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
