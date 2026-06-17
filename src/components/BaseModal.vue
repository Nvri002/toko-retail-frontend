<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue"
           class="fixed inset-0 z-50 flex items-center justify-center p-lg"
           style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);"
           @mousedown.self="$emit('update:modelValue', false)">
        <div class="card w-full shadow-elev-4 overflow-y-auto"
             :style="`max-width:${maxWidth}; max-height:90vh;`">

          <!-- Header -->
          <div class="flex items-center justify-between mb-xl">
            <h2 class="font-display font-semibold text-ink" style="font-size:18px;">
              <slot name="title" />
            </h2>
            <button @click="$emit('update:modelValue', false)"
                    class="flex items-center justify-center rounded-pill w-8 h-8 text-shade-50
                           hover:bg-shade-30/30 transition-colors text-lg leading-none border-none cursor-pointer bg-transparent">
              ✕
            </button>
          </div>

          <!-- Body -->
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  maxWidth:   { type: String,  default: '480px' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .card { transform: scale(0.96); }
</style>
