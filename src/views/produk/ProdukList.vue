<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-md mb-xl">
      <input v-model="search" @input="debounce" class="input" style="max-width:220px;"
             placeholder="🔍 Cari produk..." />
      <select v-model="katFilter" @change="load(1)" class="input" style="max-width:200px;">
        <option value="">Semua Kategori</option>
        <option v-for="k in katList" :key="k.id" :value="k.id">{{ k.nama }}</option>
      </select>
      <div class="flex-1"></div>
      <span class="text-shade-50 text-caption">{{ total }} produk</span>
      <RouterLink to="/produk/tambah" class="btn-primary btn-sm">+ Tambah Produk</RouterLink>
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-huge"><div class="spinner-dark"></div></div>
      <div v-else-if="err" class="text-center py-xxl">
        <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
        <button class="btn-primary btn-sm" @click="load(1)">Coba Lagi</button>
      </div>
      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Produk</th><th>Kategori</th><th>SKU</th>
                <th class="text-right">Harga</th><th class="text-center">Stok</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p,i) in rows" :key="p.id">
                <td class="text-shade-40 text-caption">{{ (page-1)*10+i+1 }}</td>
                <td>
                  <p class="font-medium text-ink">{{ p.nama }}</p>
                  <p class="text-shade-40 mt-xxs" style="font-size:11px;">{{ p.satuan }}</p>
                </td>
                <td>
                  <span class="pill-shade" style="font-size:10px;">{{ p.nama_kategori }}</span>
                </td>
                <td class="font-mono text-shade-50 text-caption">{{ p.kode_sku || '—' }}</td>
                <td class="text-right font-semibold text-ink">{{ rupiah(p.harga) }}</td>
                <td class="text-center">
                  <span class="pill-status text-xs"
                    :class="p.stok===0?'bg-red-100 text-red-600':p.stok<=20?'bg-yellow-100 text-yellow-700':'bg-aloe-10 text-ink'">
                    {{ p.stok }} {{ p.satuan }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="flex items-center justify-center gap-xs">
                    <RouterLink :to="`/produk/${p.id}/edit`" class="btn-outline-light btn-sm">Edit</RouterLink>
                    <button class="btn-sm rounded-pill px-md py-xs border border-red-200 text-red-500
                                   hover:bg-red-50 transition-colors bg-transparent cursor-pointer font-body"
                            style="font-size:12px;" @click="hapus(p)">Hapus</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="7" class="text-center text-shade-40 py-xxl">Produk tidak ditemukan.</td>
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
    <BaseToast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'

const loading   = ref(true), err = ref(null)
const rows      = ref([]), total = ref(0), page = ref(1)
const katList   = ref([]), search = ref(''), katFilter = ref('')
const toast     = ref(null)
let   debTimer  = null

const totalPages = ref(1)

function rupiah(n) { return 'Rp\u00A0'+Number(n).toLocaleString('id-ID') }

async function load(p=1) {
  loading.value=true; err.value=null; page.value=p
  const params = new URLSearchParams({page:p,limit:10})
  if (search.value)    params.append('search',search.value)
  if (katFilter.value) params.append('kategori_id',katFilter.value)
  try {
    const {data} = await api.get('/produk?'+params)
    rows.value  = data.data||[]; total.value = data.meta?.total||0
    totalPages.value = data.meta?.total_pages||1
  } catch(e){ err.value=e.response?.data?.message||e.message }
  finally { loading.value=false }
}

async function loadKat() {
  try { const {data}=await api.get('/kategori'); katList.value=data.data||[] } catch{}
}

function debounce() { clearTimeout(debTimer); debTimer=setTimeout(()=>load(1),400) }

async function hapus(p) {
  if (!confirm(`Hapus produk "${p.nama}"?`)) return
  try {
    await api.delete(`/produk/${p.id}`)
    toast.value.show('Produk berhasil dihapus')
    load(page.value)
  } catch(e) { toast.value.show(e.response?.data?.message||'Gagal menghapus','error') }
}

onMounted(async()=>{ await loadKat(); await load() })
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
