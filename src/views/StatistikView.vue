<template>
  <div>
    <div v-if="loading" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>
    <div v-else-if="err" class="card text-center py-xxl">
      <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
      <button class="btn-primary btn-sm" @click="load">Coba Lagi</button>
    </div>

    <template v-else>
      <!-- Filter Tahun -->
      <div class="flex items-center justify-between mb-xxl">
        <h1 class="font-display font-semibold text-ink" style="font-size:20px;">Statistik Penjualan</h1>
        <div class="flex items-center gap-sm">
          <label class="text-shade-50 text-caption">Tahun:</label>
          <select v-model="tahunDipilih" @change="load"
                  class="border border-hairline-light rounded-lg px-md py-sm text-caption text-ink bg-white">
            <option v-for="y in tahunOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-3 gap-lg mb-xxl">
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm">Total Omzet</p>
          <p class="font-display font-semibold text-ink" style="font-size:26px;">{{ rupiah(totalOmzet) }}</p>
          <p class="text-shade-40 mt-xs" style="font-size:12px;">{{ totalPesanan }} pesanan valid</p>
        </div>
        <div class="card" style="background:#c1fbd4;border-color:#a8f0bf;">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-60 mb-sm">Rata-rata / Pesanan</p>
          <p class="font-display font-semibold text-ink" style="font-size:26px;">{{ rupiah(rataRata) }}</p>
          <p class="text-shade-60 mt-xs" style="font-size:12px;">nilai transaksi rata-rata</p>
        </div>
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm">Bulan Terbaik</p>
          <p class="font-display font-semibold text-ink" style="font-size:22px;">{{ bulanTerbaik }}</p>
          <p class="text-shade-40 mt-xs" style="font-size:12px;">{{ rupiah(omzetTerbaik) }}</p>
        </div>
      </div>

      <!-- Chart + Top produk -->
      <div class="grid grid-cols-5 gap-xl mb-xxl">

        <!-- SVG Line Chart -->
        <div class="card col-span-3">
          <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">
            Tren Penjualan Bulanan {{ tahunDipilih }}
          </p>
          <div v-if="totalPesanan === 0" class="text-center text-shade-40 text-caption mb-md">
            Belum ada transaksi untuk tahun {{ tahunDipilih }}.
          </div>
          <svg :viewBox="`0 0 ${W} ${H}`" width="100%" style="overflow:visible;display:block;">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="#000" stop-opacity="0.12"/>
                  <stop offset="100%" stop-color="#000" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <line v-for="n in 5" :key="'g'+n"
                    :x1="PL" :y1="PT+(n-1)*gridStep"
                    :x2="W-PR" :y2="PT+(n-1)*gridStep"
                    stroke="#e4e4e7" stroke-width="1"/>
              <text v-for="n in 5" :key="'y'+n"
                    :x="PL-8" :y="PT+(n-1)*gridStep+4"
                    fill="#a1a1aa" font-size="10" text-anchor="end"
                    font-family="Inter, sans-serif">
                {{ shortNum(maxVal-(n-1)*(maxVal/4)) }}
              </text>
              <path :d="areaPath" fill="url(#grad)"/>
              <path :d="linePath" fill="none" stroke="#000" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
              <g v-for="(pt,i) in pts" :key="'p'+i">
                <circle v-if="pt.hasData" :cx="pt.x" :cy="pt.y" r="5" fill="#000" stroke="#fbfbf5" stroke-width="2"/>
                <circle v-else :cx="pt.x" :cy="pt.y" r="3" fill="#e4e4e7"/>
                <text :x="pt.x" :y="H-PB+16" fill="#a1a1aa" font-size="10"
                      text-anchor="middle" font-family="Inter, sans-serif">
                  {{ shortMonth(fullYearData[i].bulan) }}
                </text>
              </g>
            </svg>
        </div>

        <!-- Produk Terlaris -->
        <div class="card col-span-2">
          <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">Produk Terlaris</p>
          <div v-if="!topProduk.length" class="text-center py-xl text-shade-40 text-caption">Belum ada data.</div>
          <div class="flex flex-col gap-lg">
            <div v-for="(p,i) in topProduk" :key="p.nama_produk || p.nama">
              <div class="flex items-center justify-between mb-xs">
                <div class="flex items-center gap-sm min-w-0">
                  <div class="flex items-center justify-center rounded-md flex-shrink-0"
                       style="width:22px;height:22px;font-size:11px;font-weight:700;"
                       :style="i===0?'background:#c1fbd4;':'background:#f4f4f5;'">{{ i+1 }}</div>
                  <p class="font-medium text-ink truncate" style="font-size:13px;">{{ p.nama_produk || p.nama }}</p>
                </div>
                <p class="font-semibold text-ink flex-shrink-0 ml-sm" style="font-size:12px;">
                  {{ p.total_terjual }} unit
                </p>
              </div>
              <div class="h-2 rounded-pill overflow-hidden bg-hairline-light">
                <div class="h-full rounded-pill bg-ink transition-all duration-1000"
                     :style="{width:(maxTerjual>0?(Number(p.total_terjual)/maxTerjual*100):0).toFixed(1)+'%'}">
                </div>
              </div>
              <p class="text-shade-40 text-right mt-xxs" style="font-size:11px;">
                {{ rupiah(p.total_pendapatan) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3 kolom bawah -->
      <div class="grid grid-cols-3 gap-xl mb-xxl">
        <!-- Distribusi Status -->
        <div class="card">
          <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">Status Pesanan</p>
          <div class="flex flex-col gap-md">
            <div v-for="s in statusDist" :key="s.status">
              <div class="flex items-center justify-between mb-xxs">
                <span class="pill-status text-caption" :class="statusPill(s.status)">{{ s.status }}</span>
                <span class="font-semibold text-ink text-caption">{{ s.persentase }}%</span>
              </div>
              <div class="h-1.5 rounded-pill overflow-hidden bg-hairline-light">
                <div class="h-full rounded-pill transition-all duration-700"
                     :class="statusBarColor(s.status)"
                     :style="{width:s.persentase+'%'}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metode Bayar -->
        <div class="card">
          <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">Metode Pembayaran</p>
          <div class="flex flex-col gap-lg">
            <div v-for="m in metodeBayar" :key="m.metode_bayar" class="flex items-center justify-between">
              <div>
                <p class="font-medium text-ink" style="font-size:13px;">{{ labelBayar(m.metode_bayar) }}</p>
                <p class="text-shade-40 mt-xxs" style="font-size:11px;">{{ m.jumlah_transaksi }} transaksi</p>
              </div>
              <p class="font-semibold text-ink" style="font-size:13px;">{{ rupiah(m.total_nilai) }}</p>
            </div>
          </div>
        </div>

        <!-- Stok ringkasan -->
        <div class="card">
          <p class="font-display font-semibold text-ink mb-xl" style="font-size:15px;">Kondisi Stok</p>
          <div class="flex flex-col gap-md">
            <div v-for="s in stokRingkasan" :key="s.key"
                 class="flex items-center justify-between p-md rounded-lg"
                 :class="s.bg">
              <div class="flex items-center gap-sm">
                <span style="font-size:18px;">{{ s.icon }}</span>
                <p class="font-medium text-ink" style="font-size:13px;">{{ s.label }}</p>
              </div>
              <p class="font-display font-semibold text-ink" style="font-size:20px;">{{ s.count }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel rekap bulanan -->
      <div class="card p-0 overflow-hidden">
        <div class="px-xl py-lg border-b border-hairline-light">
          <p class="font-display font-semibold text-ink" style="font-size:15px;">
            Rekap Penjualan per Bulan — {{ tahunDipilih }}
          </p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th class="text-center">Jumlah Pesanan</th>
                <th class="text-right">Total Pendapatan</th>
                <th class="text-right">Rata-rata</th>
                <th>Proporsi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in bulanan" :key="b.bulan">
                <td class="font-medium text-ink">{{ bulanPanjang(b.bulan) }}</td>
                <!-- FIX: field yang benar adalah jumlah_pesanan, bukan total_pesanan -->
                <td class="text-center font-semibold text-ink">{{ b.jumlah_pesanan }}</td>
                <td class="text-right font-semibold text-ink">{{ rupiah(b.total_pendapatan) }}</td>
                <td class="text-right text-shade-50 text-caption">
                  {{ rupiah(Number(b.jumlah_pesanan) > 0 ? Number(b.total_pendapatan) / Number(b.jumlah_pesanan) : 0) }}
                </td>
                <td style="min-width:140px;">
                  <div class="h-1.5 rounded-pill overflow-hidden bg-hairline-light mb-xxs">
                    <div class="h-full rounded-pill bg-ink transition-all duration-700"
                         :style="{width:(totalOmzet>0?Number(b.total_pendapatan)/totalOmzet*100:0).toFixed(1)+'%'}">
                    </div>
                  </div>
                  <p class="text-shade-40" style="font-size:11px;">
                    {{ totalOmzet > 0 ? (Number(b.total_pendapatan)/totalOmzet*100).toFixed(1) : 0 }}%
                  </p>
                </td>
              </tr>
              <tr v-if="!bulanan.length">
                <td colspan="5" class="text-center text-shade-40 py-xxl">Belum ada data untuk tahun {{ tahunDipilih }}.</td>
              </tr>
            </tbody>
            <tfoot v-if="bulanan.length">
              <tr style="border-top:2px solid #e4e4e7;">
                <td class="font-semibold text-ink">TOTAL</td>
                <td class="text-center font-semibold text-ink">{{ totalPesanan }}</td>
                <td class="text-right font-display font-semibold text-ink" style="font-size:16px;">
                  {{ rupiah(totalOmzet) }}
                </td>
                <td class="text-right text-shade-50 text-caption">{{ rupiah(rataRata) }}</td>
                <td class="text-shade-40 text-caption">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading     = ref(true)
const err         = ref(null)
const bulanan     = ref([])
const topProduk   = ref([])
const statusDist  = ref([])
const metodeBayar = ref([])
const stokData    = ref({ ringkasan: { habis: 0, menipis: 0, aman: 0 } })

// Pilihan tahun: 3 tahun ke belakang + tahun ini
const currentYear  = new Date().getFullYear()
const tahunOptions = [currentYear, currentYear-1, currentYear-2, currentYear-3]
const tahunDipilih = ref(currentYear)

/* SVG Chart — selalu tampilkan 12 bulan agar visual tetap proporsional */
const W = 460, H = 180, PL = 52, PR = 16, PT = 14, PB = 26

const fullYearData = computed(() => {
  const map = {}
  bulanan.value.forEach(b => { map[b.bulan] = b })
  return Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0')
    const key = `${tahunDipilih.value}-${m}`
    return map[key] || { bulan: key, jumlah_pesanan: 0, total_pendapatan: 0 }
  })
})

const maxVal     = computed(() => Math.max(...fullYearData.value.map(b => Number(b.total_pendapatan)), 1))
const maxTerjual = computed(() => Math.max(...topProduk.value.map(p => Number(p.total_terjual)), 1))
const gridStep   = computed(() => (H - PT - PB) / 4)

const pts = computed(() => {
  const n = fullYearData.value.length
  const cW = W - PL - PR, cH = H - PT - PB
  return fullYearData.value.map((b, i) => ({
    x: PL + (i * cW) / (n - 1),
    y: PT + cH - (Number(b.total_pendapatan) / maxVal.value) * cH,
    hasData: Number(b.total_pendapatan) > 0,
  }))
})
const linePath = computed(() => pts.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') || '')
const areaPath = computed(() => {
  if (!pts.value.length) return ''
  const first = pts.value[0], last = pts.value[pts.value.length - 1], bot = H - PB
  return linePath.value + ` L${last.x},${bot} L${first.x},${bot} Z`
})

/* Stats — FIX: pakai jumlah_pesanan bukan total_pesanan */
const totalOmzet   = computed(() => bulanan.value.reduce((s, b) => s + Number(b.total_pendapatan), 0))
const totalPesanan = computed(() => bulanan.value.reduce((s, b) => s + Number(b.jumlah_pesanan), 0))
const rataRata     = computed(() => totalPesanan.value > 0 ? totalOmzet.value / totalPesanan.value : 0)
const bulanTerbaik = computed(() => {
  if (!bulanan.value.length) return '—'
  const b = bulanan.value.reduce((a, c) => Number(c.total_pendapatan) > Number(a.total_pendapatan) ? c : a)
  return bulanPanjang(b.bulan)
})
const omzetTerbaik = computed(() =>
  bulanan.value.length ? Math.max(...bulanan.value.map(b => Number(b.total_pendapatan))) : 0
)

const stokRingkasan = computed(() => [
  { key: 'habis',   label: 'Stok Habis',   icon: '🔴', bg: 'bg-red-50 border border-red-100',              count: stokData.value.ringkasan?.habis   || 0 },
  { key: 'menipis', label: 'Stok Menipis', icon: '🟡', bg: 'bg-yellow-50 border border-yellow-100',         count: stokData.value.ringkasan?.menipis || 0 },
  { key: 'aman',    label: 'Stok Aman',    icon: '🟢', bg: 'bg-aloe-10/60 border border-aloe-10',           count: stokData.value.ringkasan?.aman    || 0 },
])

function rupiah(n) { return 'Rp\u00A0' + Number(n || 0).toLocaleString('id-ID') }
function labelBayar(m) {
  return { tunai: 'Tunai', transfer: 'Transfer Bank', qris: 'QRIS', kartu_kredit: 'Kartu Kredit' }[m] || m
}
function statusPill(s) {
  return {
    selesai: 'bg-aloe-10 text-ink', pending: 'bg-shade-30/40 text-shade-60',
    diproses: 'bg-blue-100 text-blue-700', dikirim: 'bg-purple-100 text-purple-700',
    dibatalkan: 'bg-red-100 text-red-600',
  }[s] || ''
}
function statusBarColor(s) {
  return { selesai: 'bg-aloe-10', pending: 'bg-shade-30', diproses: 'bg-blue-300', dikirim: 'bg-purple-300', dibatalkan: 'bg-red-300' }[s] || 'bg-shade-30'
}
function shortNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'M'
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'jt'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'rb'
  return String(Math.round(n))
}
const BULAN   = ['', 'Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
const BULAN_P = ['', 'Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
function shortMonth(s) { if (!s) return ''; return BULAN[+s.split('-')[1]] || s }
function bulanPanjang(s) { if (!s) return '—'; const [y, m] = s.split('-'); return (BULAN_P[+m] || s) + ' ' + y }

async function load() {
  loading.value = true
  err.value     = null
  try {
    const [b, p, st, mb, stok] = await Promise.all([
      api.get(`/statistik/penjualan-bulanan?tahun=${tahunDipilih.value}`),
      api.get('/statistik/produk-terlaris?limit=5'),
      api.get('/statistik/status-pesanan'),
      api.get('/statistik/metode-pembayaran'),
      api.get('/statistik/stok-produk'),
    ])
    bulanan.value     = b.data.data    || []
    topProduk.value   = p.data.data    || []
    statusDist.value  = st.data.data   || []
    metodeBayar.value = mb.data.data   || []
    stokData.value    = stok.data.data || { ringkasan: { habis: 0, menipis: 0, aman: 0 } }
  } catch (e) {
    err.value = e.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.spinner-dark { width: 32px; height: 32px; border: 3px solid #e4e4e7; border-top-color: #000; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
