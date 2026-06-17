<template>
  <div>
    <!-- Tab filter status -->
    <div class="flex flex-wrap gap-xs mb-xl p-xs rounded-lg bg-canvas-light border border-hairline-light w-fit">
      <button v-for="t in tabs" :key="t.val"
              @click="setTab(t.val)"
              class="flex items-center gap-xs px-md py-xs rounded-md font-body font-medium transition-all border-none cursor-pointer"
              style="font-size:13px;"
              :style="activeTab===t.val
                ? 'background:#000;color:#fff;'
                : 'background:transparent;color:#71717a;'">
        {{ t.label }}
        <span class="rounded-pill px-xs py-xxs" style="font-size:10px;"
              :style="activeTab===t.val?'background:rgba(255,255,255,0.2);':'background:#f4f4f5;color:#71717a;'">
          {{ t.count }}
        </span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-md mb-xl">
      <div class="flex-1"></div>
      <span class="text-shade-50 text-caption">{{ total }} pesanan</span>
      <RouterLink to="/pesanan/tambah" class="btn-primary btn-sm">+ Buat Pesanan</RouterLink>
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>
      <div v-else-if="err" class="text-center py-xxl">
        <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
        <button class="btn-primary btn-sm" @click="load(1)">Coba Lagi</button>
      </div>
      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode Pesanan</th><th>Pelanggan</th><th>Tanggal</th>
                <th class="text-center">Item</th><th class="text-right">Total</th>
                <th class="text-center">Pembayaran</th><th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in rows" :key="o.id">
                <td>
                  <span class="font-semibold text-ink" style="font-size:13px;font-family:monospace;">
                    {{ o.kode_pesanan }}
                  </span>
                </td>
                <td>
                  <p class="font-medium text-ink" style="font-size:13px;">{{ o.nama_pelanggan }}</p>
                  <div class="flex items-center gap-xs mt-xxs">
                    <span class="text-shade-40" style="font-size:11px;">{{ o.kota }}</span>
                    <span class="pill-status" style="font-size:9px;" :class="levelPill(o.level)">{{ o.level }}</span>
                  </div>
                </td>
                <td class="text-shade-50 text-caption">{{ tglPendek(o.tanggal_pesan) }}</td>
                <td class="text-center font-semibold text-ink">{{ o.jumlah_item }}</td>
                <td class="text-right font-semibold text-ink">{{ rupiah(o.total_harga) }}</td>
                <td class="text-center text-shade-50 text-caption">{{ labelBayar(o.metode_bayar) }}</td>
                <td class="text-center">
                  <span class="pill-status" :class="statusPill(o.status)">{{ o.status }}</span>
                </td>
                <td class="text-center">
                  <RouterLink :to="`/pesanan/${o.id}`"
                    class="btn-outline-light btn-sm" style="text-decoration:none;">Detail</RouterLink>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="8" class="text-center text-shade-40 py-xxl">Tidak ada pesanan.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages>1"
             class="flex items-center justify-between px-xl py-md border-t border-hairline-light">
          <span class="text-shade-40 text-caption">Halaman {{ page }} dari {{ totalPages }}</span>
          <div class="flex gap-xs">
            <button class="btn-outline-light btn-sm" :disabled="page<=1" @click="load(page-1)">← Prev</button>
            <button class="btn-outline-light btn-sm" :disabled="page>=totalPages" @click="load(page+1)">Next →</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true), err = ref(null)
const rows = ref([]), total = ref(0), page = ref(1), totalPages = ref(1)
const activeTab = ref('')

// FIX: ambil count status dari /statistik/status-pesanan (akurat, bukan dari 1 halaman saja)
const STATUS_COUNTS = ref({ pending: 0, diproses: 0, dikirim: 0, selesai: 0, dibatalkan: 0 })

const tabs = computed(() => [
  { val: '',          label: 'Semua',      count: STATUS_COUNTS.value.total     || 0 },
  { val: 'pending',   label: 'Pending',    count: STATUS_COUNTS.value.pending   || 0 },
  { val: 'diproses',  label: 'Diproses',   count: STATUS_COUNTS.value.diproses  || 0 },
  { val: 'dikirim',   label: 'Dikirim',    count: STATUS_COUNTS.value.dikirim   || 0 },
  { val: 'selesai',   label: 'Selesai',    count: STATUS_COUNTS.value.selesai   || 0 },
  { val: 'dibatalkan',label: 'Dibatalkan', count: STATUS_COUNTS.value.dibatalkan|| 0 },
])

function rupiah(n) { return 'Rp\u00A0' + Number(n || 0).toLocaleString('id-ID') }
function tglPendek(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function labelBayar(m) {
  return { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS', kartu_kredit: 'Kartu Kredit' }[m] || m
}
function statusPill(s) {
  return { selesai: 'bg-aloe-10 text-ink', pending: 'bg-shade-30/40 text-shade-60',
           diproses: 'bg-blue-100 text-blue-700', dikirim: 'bg-purple-100 text-purple-700',
           dibatalkan: 'bg-red-100 text-red-600' }[s] || ''
}
function levelPill(l) {
  return { regular: 'bg-shade-30/40 text-shade-60', silver: 'bg-gray-100 text-gray-700',
           gold: 'bg-yellow-100 text-yellow-700', platinum: 'bg-purple-100 text-purple-700' }[l] || ''
}

// Fetch count akurat dari endpoint statistik
async function loadStatusCounts() {
  try {
    const { data } = await api.get('/statistik/status-pesanan')
    const arr = data.data || []
    const c = { total: 0, pending: 0, diproses: 0, dikirim: 0, selesai: 0, dibatalkan: 0 }
    arr.forEach(s => {
      const n = Number(s.jumlah)
      c[s.status] = n
      c.total += n
    })
    STATUS_COUNTS.value = c
  } catch { /* non-fatal, tab count kosong saja */ }
}

async function load(p = 1) {
  loading.value = true; err.value = null; page.value = p
  const params = new URLSearchParams({ page: p, limit: 10 })
  if (activeTab.value) params.append('status', activeTab.value)
  try {
    const { data } = await api.get('/pesanan?' + params)
    rows.value = data.data || []
    total.value = data.meta?.total || 0
    totalPages.value = data.meta?.total_pages || 1
  } catch (e) { err.value = e.response?.data?.message || e.message }
  finally { loading.value = false }
}

function setTab(v) { activeTab.value = v; load(1) }

onMounted(async () => {
  await Promise.all([load(), loadStatusCounts()])
})
</script>

<style scoped>
.spinner-dark { width:32px; height:32px; border:3px solid #e4e4e7; border-top-color:#000; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
