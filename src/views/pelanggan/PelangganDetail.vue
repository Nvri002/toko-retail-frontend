<template>
  <div class="max-w-2xl mx-auto">
    <!-- Back -->
    <div class="flex items-center gap-md mb-xxl">
      <RouterLink to="/pelanggan"
        class="flex items-center justify-center rounded-pill border border-hairline-light
               bg-canvas-light hover:border-ink transition-colors"
        style="width:36px;height:36px;font-size:16px;text-decoration:none;color:#000;">←</RouterLink>
      <h2 class="font-display font-semibold text-ink" style="font-size:20px;">Detail Pelanggan</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>
    <div v-else-if="err" class="card text-center py-xxl">
      <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
      <button class="btn-primary btn-sm" @click="load">Coba Lagi</button>
    </div>

    <template v-else-if="pelanggan">
      <!-- Profile card -->
      <div class="card mb-xl">
        <div class="flex items-center gap-xl mb-xl pb-xl border-b border-hairline-light">
          <div class="flex items-center justify-center rounded-pill flex-shrink-0"
               style="width:64px;height:64px;font-size:22px;font-weight:700;"
               :style="avatarStyle(pelanggan.nama)">
            {{ initials(pelanggan.nama) }}
          </div>
          <div class="flex-1">
            <h3 class="font-display font-semibold text-ink" style="font-size:22px;">{{ pelanggan.nama }}</h3>
            <p class="text-shade-50 mt-xxs" style="font-size:14px;">{{ pelanggan.email }}</p>
            <span class="pill-status mt-sm inline-block" :class="levelPill(pelanggan.level)">
              {{ pelanggan.level }}
            </span>
          </div>
          <RouterLink :to="`/pelanggan/${pelanggan.id}/edit`"
            class="btn-outline-light btn-sm" style="text-decoration:none;">Edit</RouterLink>
        </div>

        <div class="grid grid-cols-2 gap-lg">
          <div v-for="field in infoFields" :key="field.label">
            <p class="text-eyebrow text-shade-40 font-medium tracking-widest uppercase mb-xxs"
               style="font-size:10px;">{{ field.label }}</p>
            <p class="font-body text-ink" style="font-size:14px;">{{ field.value || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Stat ringkasan -->
      <div class="grid grid-cols-2 gap-md mb-xl">
        <div class="card" style="background:#c1fbd4;border-color:#a8f0bf;">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-60 mb-sm"
             style="font-size:10px;">Total Pesanan</p>
          <p class="font-display font-semibold text-ink" style="font-size:28px;">{{ pesananList.length }}</p>
        </div>
        <div class="card">
          <p class="text-eyebrow font-medium tracking-widest uppercase text-shade-50 mb-sm"
             style="font-size:10px;">Total Belanja</p>
          <p class="font-display font-semibold text-ink" style="font-size:22px;">{{ rupiah(totalBelanja) }}</p>
        </div>
      </div>

      <!-- Riwayat pesanan -->
      <div class="card p-0 overflow-hidden">
        <div class="px-xl py-lg border-b border-hairline-light">
          <p class="font-display font-semibold text-ink" style="font-size:15px;">Riwayat Pesanan</p>
        </div>
        <div v-if="!pesananList.length" class="text-center py-xxl text-shade-40 text-caption">
          Belum ada pesanan.
        </div>
        <div v-for="o in pesananList" :key="o.id"
             class="flex items-center justify-between px-xl py-md border-b border-hairline-light/60
                    hover:bg-canvas-cream/60 transition-colors">
          <div>
            <p class="font-semibold text-ink" style="font-size:13px;font-family:monospace;">
              {{ o.kode_pesanan }}
            </p>
            <p class="text-shade-40 mt-xxs" style="font-size:11px;">
              {{ tglPendek(o.tanggal_pesan) }} · {{ o.jumlah_item }} item
            </p>
          </div>
          <div class="flex items-center gap-md">
            <span class="pill-status" :class="statusPill(o.status)">{{ o.status }}</span>
            <p class="font-semibold text-ink" style="font-size:13px;">{{ rupiah(o.total_harga) }}</p>
            <RouterLink :to="`/pesanan/${o.id}`"
              class="text-shade-40 hover:text-ink transition-colors" style="font-size:12px;text-decoration:none;">
              →
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route   = useRoute()
const loading = ref(true), err = ref(null)
const pelanggan = ref(null), pesananList = ref([])

const AVATAR_COLORS = ['#c1fbd4','#d4f9e0','#fef3c7','#dbeafe','#ede9fe','#fce7f3']
function initials(n='') { return n.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join('') }
function avatarStyle(n='') {
  const bg=AVATAR_COLORS[(n.charCodeAt(0)||0)%AVATAR_COLORS.length]
  return `background:${bg};color:#000;`
}
function rupiah(n) { return 'Rp\u00A0'+Number(n||0).toLocaleString('id-ID') }
function tglPendek(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})
}
function levelPill(l) {
  return {regular:'bg-shade-30/40 text-shade-60',silver:'bg-gray-100 text-gray-700',
          gold:'bg-yellow-100 text-yellow-700',platinum:'bg-purple-100 text-purple-700'}[l]||''
}
function statusPill(s) {
  return {selesai:'bg-aloe-10 text-ink',pending:'bg-shade-30/40 text-shade-60',
          diproses:'bg-blue-100 text-blue-700',dikirim:'bg-purple-100 text-purple-700',
          dibatalkan:'bg-red-100 text-red-600'}[s]||''
}

const totalBelanja = computed(() =>
  pesananList.value
    .filter(o=>o.status!=='dibatalkan')
    .reduce((s,o)=>s+Number(o.total_harga),0)
)

const infoFields = computed(() => [
  { label: 'Telepon',    value: pelanggan.value?.telepon },
  { label: 'Kota',       value: pelanggan.value?.kota },
  { label: 'Alamat',     value: pelanggan.value?.alamat },
  { label: 'Bergabung',  value: tglPendek(pelanggan.value?.created_at) },
])

async function load() {
  loading.value=true; err.value=null
  try {
    const [resPel, resPes] = await Promise.all([
      api.get(`/pelanggan/${route.params.id}`),
      api.get(`/pelanggan/${route.params.id}/pesanan`),
    ])
    pelanggan.value   = resPel.data.data
    pesananList.value = resPes.data.data || []
  } catch(e){ err.value=e.response?.data?.message||e.message }
  finally { loading.value=false }
}

onMounted(load)
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
