<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-huge">
      <div class="spinner-dark"></div>
    </div>

    <!-- Error -->
    <div v-else-if="err" class="card text-center py-xxl">
      <p style="font-size:32px;" class="mb-md">⚠️</p>
      <p class="font-display font-semibold text-ink mb-sm" style="font-size:18px;">Gagal memuat dashboard</p>
      <p class="text-shade-50 mb-xl text-caption">{{ err }}</p>
      <button class="btn-primary" @click="load">Coba Lagi</button>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-lg mb-xxl">
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm">Total Pendapatan</p>
          <p class="font-display font-semibold text-ink" style="font-size:24px;">{{ rupiah(ringkasan.total_pendapatan) }}</p>
          <p class="text-shade-40 mt-xs" style="font-size:12px;">{{ ringkasan.total_pesanan }} total pesanan</p>
        </div>
        <div class="card" style="background:#c1fbd4;border-color:#a8f0bf;">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-60 mb-sm">Pesanan Selesai</p>
          <p class="font-display font-semibold text-ink" style="font-size:24px;">{{ ringkasan.pesanan_selesai }}</p>
          <p class="text-shade-60 mt-xs" style="font-size:12px;">dari {{ ringkasan.total_pesanan }} pesanan</p>
        </div>
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm">Total Produk</p>
          <p class="font-display font-semibold text-ink" style="font-size:24px;">{{ ringkasan.total_produk }}</p>
          <p class="text-shade-40 mt-xs" style="font-size:12px;">{{ ringkasan.total_stok ?? 0 }} unit stok</p>
        </div>
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm">Total Pelanggan</p>
          <p class="font-display font-semibold text-ink" style="font-size:24px;">{{ ringkasan.total_pelanggan }}</p>
          <p class="text-shade-40 mt-xs" style="font-size:12px;">pelanggan terdaftar</p>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="card mb-xxl">
        <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-lg">Status Pesanan</p>
        <div class="grid grid-cols-5 gap-md">
          <div v-for="s in statusList" :key="s.key" class="text-center">
            <p class="font-display font-semibold text-ink mb-xs" style="font-size:22px;">
              {{ statusMap[s.key] ?? 0 }}
            </p>
            <span class="pill-status" :class="s.pill">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Two columns -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xxl">

        <!-- Pesanan Terbaru -->
        <div class="card p-0 overflow-hidden">
          <div class="flex items-center justify-between px-xl py-lg border-b border-hairline-light">
            <p class="font-display font-semibold text-ink" style="font-size:15px;">Pesanan Terbaru</p>
            <RouterLink to="/pesanan" class="font-body font-medium text-shade-50 hover:text-ink transition-colors"
                        style="font-size:12px;">Lihat semua →</RouterLink>
          </div>
          <div>
            <div v-if="!recentOrders.length" class="px-xl py-xxl text-center text-shade-40 text-caption">
              Belum ada pesanan.
            </div>
            <div v-for="o in recentOrders" :key="o.id"
                 class="flex items-center justify-between px-xl py-md border-b border-hairline-light/60 hover:bg-canvas-cream/60 transition-colors">
              <div>
                <p class="font-body font-semibold text-ink" style="font-size:13px;font-family:monospace;">{{ o.kode_pesanan }}</p>
                <p class="text-shade-40 mt-xxs" style="font-size:12px;">{{ o.nama_pelanggan || o.pelanggan }}</p>
              </div>
              <div class="text-right">
                <p class="font-body font-semibold text-ink" style="font-size:13px;">{{ rupiah(o.total_harga) }}</p>
                <span class="pill-status mt-xxs" :class="statusPill(o.status)">{{ o.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Produk Terlaris -->
        <div class="card p-0 overflow-hidden">
          <div class="flex items-center justify-between px-xl py-lg border-b border-hairline-light">
            <p class="font-display font-semibold text-ink" style="font-size:15px;">Produk Terlaris</p>
            <RouterLink to="/produk" class="font-body font-medium text-shade-50 hover:text-ink transition-colors"
                        style="font-size:12px;">Lihat semua →</RouterLink>
          </div>
          <div class="px-xl py-lg flex flex-col gap-lg">
            <div v-if="!topProduk.length" class="text-center text-shade-40 text-caption py-lg">
              Belum ada data.
            </div>
            <div v-for="(p, i) in topProduk" :key="i" class="flex items-center gap-md">
              <div class="flex items-center justify-center rounded-md flex-shrink-0"
                   style="width:28px;height:28px;font-size:12px;font-weight:700;"
                   :style="i===0?'background:#c1fbd4;':'background:#f4f4f5;'">
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-body font-medium text-ink truncate" style="font-size:13px;">{{ p.nama_produk || p.nama }}</p>
                <p class="text-shade-40" style="font-size:11px;">{{ p.nama_kategori || p.kategori }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-body font-semibold text-ink" style="font-size:13px;">{{ p.total_terjual }} terjual</p>
                <p class="text-shade-40" style="font-size:11px;">stok: {{ p.stok ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Penjualan per Kategori -->
      <div class="card">
        <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">Penjualan per Kategori</p>
        <div v-if="!salesKat.length" class="text-center py-xl text-shade-40 text-caption">Belum ada data.</div>
        <div class="flex flex-col gap-md">
          <div v-for="k in salesKat" :key="k.nama_kategori || k.nama"
               class="grid items-center gap-lg"
               style="grid-template-columns:140px 1fr 160px;">
            <p class="font-body text-shade-50 text-right truncate" style="font-size:13px;">{{ k.nama_kategori || k.nama }}</p>
            <div class="h-2 rounded-pill overflow-hidden bg-hairline-light">
              <div class="h-full rounded-pill bg-ink transition-all duration-1000"
                   :style="{ width: barW(k.total_pendapatan || k.total) + '%' }"></div>
            </div>
            <p class="font-body font-semibold text-ink" style="font-size:13px;">{{ rupiah(k.total_pendapatan || k.total) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading      = ref(true)
const err          = ref(null)
const ringkasan    = ref({})
const statusMap    = ref({})
const recentOrders = ref([])
const topProduk    = ref([])
const salesKat     = ref([])

const statusList = [
  { key: 'pending',    label: 'Pending',    pill: 'bg-shade-30/40 text-shade-60' },
  { key: 'diproses',   label: 'Diproses',   pill: 'bg-blue-100 text-blue-700' },
  { key: 'dikirim',    label: 'Dikirim',    pill: 'bg-purple-100 text-purple-700' },
  { key: 'selesai',    label: 'Selesai',    pill: 'bg-aloe-10 text-ink' },
  { key: 'dibatalkan', label: 'Dibatalkan', pill: 'bg-red-100 text-red-600' },
]

const maxSales = computed(() => Math.max(...salesKat.value.map(k => Number(k.total_pendapatan || k.total || 0)), 1))
function barW(v) { return ((Number(v) / maxSales.value) * 100).toFixed(1) }

function rupiah(n) {
  if (n === null || n === undefined) return '—'
  return 'Rp\u00A0' + Number(n).toLocaleString('id-ID')
}

function statusPill(s) {
  return {
    selesai:    'bg-aloe-10 text-ink',
    pending:    'bg-shade-30/40 text-shade-60',
    diproses:   'bg-blue-100 text-blue-700',
    dikirim:    'bg-purple-100 text-purple-700',
    dibatalkan: 'bg-red-100 text-red-600',
  }[s] || 'bg-shade-30/40 text-shade-60'
}

async function load() {
  loading.value = true
  err.value     = null
  try {
    // Paralel call ke semua endpoint yang dibutuhkan dashboard
    const [ringRes, statusRes, pesananRes, produkRes, katRes] = await Promise.all([
      api.get('/statistik/ringkasan'),
      api.get('/statistik/status-pesanan'),
      api.get('/pesanan?limit=5&sort=terbaru'),
      api.get('/statistik/produk-terlaris?limit=5'),
      api.get('/statistik/penjualan-per-kategori'),
    ])

    ringkasan.value = ringRes.data.data || {}

    // Ubah array status jadi object { pending: 12, selesai: 30, ... }
    const statusArr = statusRes.data.data || []
    statusMap.value = {}
    statusArr.forEach(s => { statusMap.value[s.status] = s.jumlah })

    recentOrders.value = pesananRes.data.data || []
    topProduk.value    = produkRes.data.data  || []
    salesKat.value     = katRes.data.data     || []

  } catch (e) {
    err.value = e.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.spinner-dark {
  width: 36px; height: 36px;
  border: 3px solid #e4e4e7;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
