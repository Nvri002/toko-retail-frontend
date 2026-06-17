<template>
  <header class="sticky top-0 z-30 flex items-center justify-between px-xxl py-md bg-canvas-cream border-b border-hairline-light">
    <!-- Page title -->
    <div>
      <h1 class="font-display font-semibold text-ink leading-none" style="font-size:18px;">
        {{ pageTitle }}
      </h1>
      <p class="text-shade-50 mt-xxs" style="font-size:12px;">{{ pageDesc }}</p>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-md">
      <!-- Date -->
      <span class="text-shade-40 font-body" style="font-size:12px;">{{ today }}</span>

      <!-- Badge role -->
      <span class="pill-mint text-micro">{{ role }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth  = useAuthStore()

const role = computed(() => auth.user?.role || 'staff')

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

const pageMeta = {
  '/dashboard':  { title: 'Dashboard',   desc: 'Ringkasan performa toko hari ini' },
  '/kategori':   { title: 'Kategori',    desc: 'Kelola kategori produk' },
  '/produk':     { title: 'Produk',      desc: 'Kelola produk & inventaris' },
  '/pelanggan':  { title: 'Pelanggan',   desc: 'Data dan riwayat pelanggan' },
  '/pesanan':    { title: 'Pesanan',     desc: 'Manajemen transaksi penjualan' },
  '/statistik':  { title: 'Statistik',   desc: 'Analitik dan laporan penjualan' },
}

const pageTitle = computed(() => {
  const matched = Object.entries(pageMeta).find(([path]) => route.path.startsWith(path))
  return matched?.[1]?.title ?? 'TokoRetail'
})
const pageDesc = computed(() => {
  const matched = Object.entries(pageMeta).find(([path]) => route.path.startsWith(path))
  return matched?.[1]?.desc ?? ''
})
</script>
