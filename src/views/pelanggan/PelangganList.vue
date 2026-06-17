<template>
  <div>
    <!-- Mini stats level -->
    <div class="grid grid-cols-4 gap-md mb-xl">
      <div v-for="lv in levelStats" :key="lv.key"
           class="card flex items-center gap-md py-lg">
        <span style="font-size:24px;">{{ lv.icon }}</span>
        <div>
          <p class="font-display font-semibold text-ink" style="font-size:22px;">{{ lv.count }}</p>
          <span class="pill-status" :class="lv.pill" style="font-size:10px;">{{ lv.label }}</span>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-md mb-xl">
      <input v-model="search" @input="debounce" class="input" style="max-width:220px;"
             placeholder="🔍 Cari nama / email..." />
      <select v-model="lvFilter" @change="load(1)" class="input" style="max-width:170px;">
        <option value="">Semua Level</option>
        <option v-for="l in ['regular','silver','gold','platinum']" :key="l" :value="l"
                style="text-transform:capitalize;">{{ l }}</option>
      </select>
      <div class="flex-1"></div>
      <span class="text-shade-50 text-caption">{{ total }} pelanggan</span>
      <RouterLink to="/pelanggan/tambah" class="btn-primary btn-sm">+ Tambah Pelanggan</RouterLink>
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
                <th>Pelanggan</th><th>Kontak</th><th>Kota</th>
                <th class="text-center">Level</th>
                <th class="text-right">Total Belanja</th>
                <th class="text-center">Pesanan</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in rows" :key="p.id">
                <td>
                  <div class="flex items-center gap-sm">
                    <div class="flex items-center justify-center rounded-pill flex-shrink-0"
                         style="width:36px;height:36px;font-size:13px;font-weight:700;"
                         :style="avatarStyle(p.nama)">
                      {{ initials(p.nama) }}
                    </div>
                    <div>
                      <p class="font-medium text-ink">{{ p.nama }}</p>
                      <p class="text-shade-40 mt-xxs" style="font-size:11px;">#{{ p.id }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-ink" style="font-size:13px;">{{ p.email }}</p>
                  <p class="text-shade-40 mt-xxs" style="font-size:11px;">{{ p.telepon || '—' }}</p>
                </td>
                <td class="text-shade-50 text-caption">{{ p.kota || '—' }}</td>
                <td class="text-center">
                  <span class="pill-status" :class="levelPill(p.level)">{{ p.level }}</span>
                </td>
                <td class="text-right font-semibold text-ink">{{ rupiah(p.total_belanja) }}</td>
                <td class="text-center font-semibold text-ink">{{ p.total_pesanan }}</td>
                <td class="text-center">
                  <div class="flex items-center justify-center gap-xs">
                    <RouterLink :to="`/pelanggan/${p.id}`"
                      class="btn-outline-light btn-sm" style="text-decoration:none;">Detail</RouterLink>
                    <RouterLink :to="`/pelanggan/${p.id}/edit`"
                      class="btn-outline-light btn-sm" style="text-decoration:none;">Edit</RouterLink>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="7" class="text-center text-shade-40 py-xxl">Pelanggan tidak ditemukan.</td>
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

const loading  = ref(true), err = ref(null)
const rows     = ref([]), total = ref(0), page = ref(1), totalPages = ref(1)
const search   = ref(''), lvFilter = ref('')
let   debTimer = null

const AVATAR_COLORS = ['#c1fbd4','#d4f9e0','#fef3c7','#dbeafe','#ede9fe','#fce7f3']
function initials(n='') { return n.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join('') }
function avatarStyle(n='') {
  const bg = AVATAR_COLORS[(n.charCodeAt(0)||0)%AVATAR_COLORS.length]
  return `background:${bg};color:#000;`
}
function rupiah(n) { return 'Rp\u00A0'+Number(n||0).toLocaleString('id-ID') }
function levelPill(l) {
  return { regular:'bg-shade-30/40 text-shade-60', silver:'bg-gray-100 text-gray-700',
           gold:'bg-yellow-100 text-yellow-700', platinum:'bg-purple-100 text-purple-700' }[l]||'bg-shade-30/40 text-shade-60'
}

const levelStats = computed(() => {
  const c = {regular:0,silver:0,gold:0,platinum:0}
  rows.value.forEach(r=>{ if(c[r.level]!==undefined) c[r.level]++ })
  return [
    {key:'regular',  label:'Regular',  icon:'👤', count:c.regular,  pill:'bg-shade-30/40 text-shade-60'},
    {key:'silver',   label:'Silver',   icon:'🥈', count:c.silver,   pill:'bg-gray-100 text-gray-700'},
    {key:'gold',     label:'Gold',     icon:'🥇', count:c.gold,     pill:'bg-yellow-100 text-yellow-700'},
    {key:'platinum', label:'Platinum', icon:'💎', count:c.platinum, pill:'bg-purple-100 text-purple-700'},
  ]
})

async function load(p=1) {
  loading.value=true; err.value=null; page.value=p
  const params=new URLSearchParams({page:p,limit:10})
  if (search.value)   params.append('search',search.value)
  if (lvFilter.value) params.append('level',lvFilter.value)
  try {
    const {data}=await api.get('/pelanggan?'+params)
    rows.value=data.data||[]; total.value=data.meta?.total||0
    totalPages.value=data.meta?.total_pages||1
  } catch(e){ err.value=e.response?.data?.message||e.message }
  finally { loading.value=false }
}

function debounce() { clearTimeout(debTimer); debTimer=setTimeout(()=>load(1),400) }
onMounted(()=>load())
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
