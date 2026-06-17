<template>
  <div class="card flex flex-col gap-sm" :class="variant === 'aloe' ? 'card-aloe' : ''">
    <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50">{{ label }}</p>
    <p class="font-display font-semibold text-ink leading-none" style="font-size:28px;">{{ value }}</p>
    <p v-if="sub" class="text-shade-40" style="font-size:12px;">{{ sub }}</p>
  </div>
</template>

<script setup>
defineProps({
  label:   { type: String, required: true },
  value:   { type: [String, Number], required: true },
  sub:     { type: String, default: '' },
  variant: { type: String, default: 'default' },
})
</script>
