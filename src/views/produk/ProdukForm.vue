<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-md mb-xxl">
      <RouterLink to="/produk"
        class="flex items-center justify-center rounded-pill border border-hairline-light bg-canvas-light
               hover:border-ink transition-colors"
        style="width:36px;height:36px;font-size:16px;text-decoration:none;color:#000;">
        ←
      </RouterLink>
      <div>
        <h2 class="font-display font-semibold text-ink" style="font-size:20px;">
          {{ isEdit ? 'Edit Produk' : 'Tambah Produk' }}
        </h2>
        <p class="text-shade-40 text-caption">{{ isEdit ? `ID #${route.params.id}` : 'Isi detail produk baru' }}</p>
      </div>
    </div>

    <!-- Loading data (edit mode) -->
    <div v-if="loadingData" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>

    <form v-else @submit.prevent="simpan" class="flex flex-col gap-xl">
      <div class="card flex flex-col gap-lg">
        <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Informasi Produk</h3>

        <div>
          <label class="label">Nama Produk <span class="text-red-400">*</span></label>
          <input v-model="form.nama" class="input" :class="{'input-error':fErr.nama}"
                 placeholder="Nama lengkap produk" />
          <p v-if="fErr.nama" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.nama }}</p>
        </div>

        <div>
          <label class="label">Kategori <span class="text-red-400">*</span></label>
          <select v-model="form.kategori_id" class="input" :class="{'input-error':fErr.kategori_id}">
            <option value="">— Pilih Kategori —</option>
            <option v-for="k in katList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
          <p v-if="fErr.kategori_id" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.kategori_id }}</p>
        </div>
      </div>

      <div class="card flex flex-col gap-lg">
        <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Harga & Stok</h3>

        <div class="grid grid-cols-2 gap-lg">
          <div>
            <label class="label">Harga (Rp) <span class="text-red-400">*</span></label>
            <input v-model="form.harga" type="number" min="0" class="input" :class="{'input-error':fErr.harga}"
                   placeholder="0" />
            <p v-if="fErr.harga" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.harga }}</p>
          </div>
          <div>
            <label class="label">Stok</label>
            <input v-model="form.stok" type="number" min="0" class="input" placeholder="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-lg">
          <div>
            <label class="label">Satuan</label>
            <input v-model="form.satuan" class="input" placeholder="pcs" />
          </div>
          <div>
            <label class="label">Kode SKU</label>
            <input v-model="form.kode_sku" class="input" :class="{'input-error':fErr.kode_sku}"
                   placeholder="ELK-001" />
            <p v-if="fErr.kode_sku" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.kode_sku }}</p>
          </div>
        </div>
      </div>

      <!-- Error global -->
      <div v-if="fErr.global"
           class="flex items-center gap-sm px-lg py-md rounded-lg border"
           style="background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2);">
        <span style="color:#f87171;">⚠</span>
        <span class="text-red-500 text-caption">{{ fErr.global }}</span>
      </div>

      <div class="flex gap-sm">
        <RouterLink to="/produk" class="btn-outline-light flex-1 text-center" style="text-decoration:none;">
          Batal
        </RouterLink>
        <button type="submit" class="btn-primary flex-1" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          {{ saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Produk') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route  = useRoute()
const router = useRouter()

const isEdit     = computed(() => !!route.params.id)
const loadingData= ref(false)
const saving     = ref(false)
const katList    = ref([])
const form       = reactive({ nama:'', kategori_id:'', harga:'', stok:0, satuan:'pcs', kode_sku:'' })
const fErr       = reactive({ nama:'', kategori_id:'', harga:'', kode_sku:'', global:'' })

async function loadKat() {
  try { const {data}=await api.get('/kategori'); katList.value=data.data||[] } catch{}
}

async function loadProduk() {
  loadingData.value=true
  try {
    const {data}=await api.get(`/produk/${route.params.id}`)
    const p=data.data
    Object.assign(form, {
      nama: p.nama, kategori_id: p.kategori_id,
      harga: p.harga, stok: p.stok, satuan: p.satuan, kode_sku: p.kode_sku||''
    })
  } catch(e) { fErr.global=e.response?.data?.message||'Gagal memuat data produk' }
  finally { loadingData.value=false }
}

function validate() {
  Object.assign(fErr,{nama:'',kategori_id:'',harga:'',kode_sku:'',global:''})
  let ok=true
  if (!form.nama.trim())          { fErr.nama='Nama produk wajib diisi'; ok=false }
  if (!form.kategori_id)          { fErr.kategori_id='Kategori wajib dipilih'; ok=false }
  if (!form.harga && form.harga!==0){ fErr.harga='Harga wajib diisi'; ok=false }
  if (Number(form.harga)<0)       { fErr.harga='Harga tidak boleh negatif'; ok=false }
  return ok
}

async function simpan() {
  if (!validate()) return
  saving.value=true
  const payload = {
    nama: form.nama, kategori_id: Number(form.kategori_id),
    harga: Number(form.harga), stok: Number(form.stok)||0,
    satuan: form.satuan||'pcs', kode_sku: form.kode_sku||undefined
  }
  try {
    if (isEdit.value) {
      await api.put(`/produk/${route.params.id}`, payload)
    } else {
      await api.post('/produk', payload)
    }
    router.push('/produk')
  } catch(e) { fErr.global=e.response?.data?.message||'Gagal menyimpan produk' }
  finally { saving.value=false }
}

onMounted(async()=>{ await loadKat(); if (isEdit.value) await loadProduk() })
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
.spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
