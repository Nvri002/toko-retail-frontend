<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-md mb-xxl">
      <RouterLink to="/pesanan"
        class="flex items-center justify-center rounded-pill border border-hairline-light
               bg-canvas-light hover:border-ink transition-colors"
        style="width:36px;height:36px;font-size:16px;text-decoration:none;color:#000;">←</RouterLink>
      <div>
        <h2 class="font-display font-semibold text-ink" style="font-size:20px;">Buat Pesanan Baru</h2>
        <p class="text-shade-40 text-caption">Pilih pelanggan dan tambahkan produk</p>
      </div>
    </div>

    <form @submit.prevent="simpan" class="flex flex-col gap-xl">
      <!-- Pelanggan -->
      <div class="card flex flex-col gap-lg">
        <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Pelanggan</h3>
        <div>
          <label class="label">Pilih Pelanggan <span class="text-red-400">*</span></label>
          <select v-model="form.pelanggan_id" class="input" :class="{'input-error':fErr.pelanggan_id}">
            <option value="">— Pilih Pelanggan —</option>
            <option v-for="p in pelangganList" :key="p.id" :value="p.id">
              {{ p.nama }} ({{ p.email }})
            </option>
          </select>
          <p v-if="fErr.pelanggan_id" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.pelanggan_id }}</p>
        </div>
        <div class="grid grid-cols-2 gap-lg">
          <div>
            <label class="label">Metode Pembayaran</label>
            <select v-model="form.metode_bayar" class="input">
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer Bank</option>
              <option value="qris">QRIS</option>
              <option value="kartu_kredit">Kartu Kredit</option>
            </select>
          </div>
          <div>
            <label class="label">Catatan</label>
            <input v-model="form.catatan" class="input" placeholder="Opsional" />
          </div>
        </div>
      </div>

      <!-- Produk Items -->
      <div class="card flex flex-col gap-lg">
        <div class="flex items-center justify-between">
          <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Item Produk</h3>
          <button type="button" class="btn-aloe btn-sm" @click="tambahItem">+ Tambah Produk</button>
        </div>

        <p v-if="fErr.items" class="text-red-400 text-caption">{{ fErr.items }}</p>

        <div v-if="form.items.length===0"
             class="text-center py-xl text-shade-40 text-caption border-2 border-dashed border-hairline-light rounded-lg">
          Belum ada produk. Klik "+ Tambah Produk".
        </div>

        <div v-for="(item, idx) in form.items" :key="idx"
             class="flex items-end gap-md p-lg rounded-lg bg-canvas-cream border border-hairline-light">
          <div class="flex-1">
            <label class="label">Produk <span class="text-red-400">*</span></label>
            <select v-model="item.produk_id" class="input" @change="onProdukChange(item)">
              <option value="">— Pilih Produk —</option>
              <option v-for="p in produkList" :key="p.id" :value="p.id">
                {{ p.nama }} (stok: {{ p.stok }})
              </option>
            </select>
          </div>
          <div style="width:100px;">
            <label class="label">Jumlah</label>
            <input v-model.number="item.jumlah" type="number" min="1" class="input" placeholder="1" />
          </div>
          <div style="width:130px;">
            <label class="label">Harga Satuan</label>
            <p class="input bg-canvas-cream text-shade-50" style="cursor:default;">
              {{ item.harga_satuan ? rupiah(item.harga_satuan) : '—' }}
            </p>
          </div>
          <button type="button"
                  class="flex items-center justify-center rounded-pill border border-red-200 text-red-400
                         hover:bg-red-50 transition-colors mb-px"
                  style="width:36px;height:36px;background:transparent;cursor:pointer;flex-shrink:0;"
                  @click="hapusItem(idx)">✕</button>
        </div>

        <!-- Total -->
        <div v-if="form.items.length>0"
             class="flex items-center justify-between pt-lg border-t border-hairline-light">
          <p class="font-display font-semibold text-ink" style="font-size:15px;">Total</p>
          <p class="font-display font-semibold text-ink" style="font-size:22px;">{{ rupiah(totalHarga) }}</p>
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
        <RouterLink to="/pesanan" class="btn-outline-light flex-1 text-center" style="text-decoration:none;">
          Batal
        </RouterLink>
        <button type="submit" class="btn-primary flex-1" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          {{ saving ? 'Memproses...' : 'Buat Pesanan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const saving = ref(false)
const pelangganList = ref([])
const produkList    = ref([])

const form = reactive({
  pelanggan_id: '',
  metode_bayar: 'tunai',
  catatan: '',
  items: [],
})
const fErr = reactive({ pelanggan_id:'', items:'', global:'' })

const totalHarga = computed(() =>
  form.items.reduce((s,i)=>s+(Number(i.harga_satuan||0)*Number(i.jumlah||0)),0)
)

function rupiah(n){ return 'Rp\u00A0'+Number(n||0).toLocaleString('id-ID') }

function tambahItem() {
  form.items.push({ produk_id:'', jumlah:1, harga_satuan:0 })
}
function hapusItem(idx) { form.items.splice(idx,1) }
function onProdukChange(item) {
  const p = produkList.value.find(p=>p.id===item.produk_id)
  item.harga_satuan = p ? Number(p.harga) : 0
}

async function loadOptions() {
  try {
    const [resPel, resProd] = await Promise.all([
      api.get('/pelanggan?limit=100'),
      api.get('/produk?limit=100'),
    ])
    pelangganList.value = resPel.data.data  || []
    produkList.value    = resProd.data.data || []
  } catch(e){ fErr.global = 'Gagal memuat data' }
}

function validate() {
  Object.assign(fErr,{pelanggan_id:'',items:'',global:''})
  let ok = true
  if (!form.pelanggan_id) { fErr.pelanggan_id='Pelanggan wajib dipilih'; ok=false }
  if (!form.items.length) { fErr.items='Minimal 1 produk harus ditambahkan'; ok=false }
  for (const item of form.items) {
    if (!item.produk_id) { fErr.items='Pilih produk untuk setiap item'; ok=false; break }
    if (!item.jumlah || item.jumlah<1) { fErr.items='Jumlah minimal 1 untuk setiap item'; ok=false; break }
  }
  return ok
}

async function simpan() {
  if (!validate()) return
  saving.value = true
  const payload = {
    pelanggan_id: Number(form.pelanggan_id),
    metode_bayar: form.metode_bayar,
    catatan:      form.catatan || undefined,
    items: form.items.map(i=>({ produk_id:Number(i.produk_id), jumlah:Number(i.jumlah) }))
  }
  try {
    await api.post('/pesanan', payload)
    router.push('/pesanan')
  } catch(e){ fErr.global=e.response?.data?.message||'Gagal membuat pesanan' }
  finally { saving.value=false }
}

onMounted(loadOptions)
</script>

<style scoped>
.spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
