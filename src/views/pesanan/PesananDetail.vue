<template>
  <div class="max-w-2xl mx-auto">
    <!-- Back -->
    <div class="flex items-center gap-md mb-xxl">
      <RouterLink to="/pesanan"
        class="flex items-center justify-center rounded-pill border border-hairline-light
               bg-canvas-light hover:border-ink transition-colors"
        style="width:36px;height:36px;font-size:16px;text-decoration:none;color:#000;">←</RouterLink>
      <h2 class="font-display font-semibold text-ink" style="font-size:20px;">Detail Pesanan</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>
    <div v-else-if="err" class="card text-center py-xxl">
      <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
      <button class="btn-primary btn-sm" @click="load">Coba Lagi</button>
    </div>

    <template v-else-if="pesanan">
      <!-- Header info -->
      <div class="card mb-xl">
        <div class="flex items-start justify-between mb-xl pb-xl border-b border-hairline-light">
          <div>
            <p class="font-display font-semibold text-ink" style="font-size:22px;font-family:monospace;">
              {{ pesanan.kode_pesanan }}
            </p>
            <p class="text-shade-50 mt-xs text-caption">{{ tglLengkap(pesanan.tanggal_pesan) }}</p>
          </div>
          <span class="pill-status text-sm" :class="statusPill(pesanan.status)">
            {{ pesanan.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-lg mb-xl">
          <div>
            <p class="text-eyebrow text-shade-40 font-medium tracking-widest uppercase mb-xxs" style="font-size:10px;">Pelanggan</p>
            <p class="font-medium text-ink" style="font-size:14px;">{{ pesanan.nama_pelanggan }}</p>
            <p class="text-shade-40 mt-xxs" style="font-size:12px;">{{ pesanan.email_pelanggan }}</p>
          </div>
          <div>
            <p class="text-eyebrow text-shade-40 font-medium tracking-widest uppercase mb-xxs" style="font-size:10px;">Pembayaran</p>
            <p class="font-medium text-ink" style="font-size:14px;">{{ labelBayar(pesanan.metode_bayar) }}</p>
          </div>
          <div>
            <p class="text-eyebrow text-shade-40 font-medium tracking-widest uppercase mb-xxs" style="font-size:10px;">Kota</p>
            <p class="font-medium text-ink" style="font-size:14px;">{{ pesanan.kota || '—' }}</p>
          </div>
          <div v-if="pesanan.catatan">
            <p class="text-eyebrow text-shade-40 font-medium tracking-widest uppercase mb-xxs" style="font-size:10px;">Catatan</p>
            <p class="font-medium text-ink" style="font-size:14px;">{{ pesanan.catatan }}</p>
          </div>
        </div>

        <!-- Update Status -->
        <div class="flex items-center gap-md pt-xl border-t border-hairline-light">
          <label class="label mb-0">Ubah Status:</label>
          <select v-model="newStatus" class="input" style="max-width:180px;">
            <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn-aloe btn-sm" :disabled="savingStatus || newStatus===pesanan.status"
                  @click="updateStatus">
            <span v-if="savingStatus" class="spinner-xs"></span>
            {{ savingStatus ? 'Menyimpan...' : 'Simpan Status' }}
          </button>
        </div>
      </div>

      <!-- Items -->
      <div class="card p-0 overflow-hidden mb-xl">
        <div class="px-xl py-lg border-b border-hairline-light">
          <p class="font-display font-semibold text-ink" style="font-size:15px;">Item Pesanan</p>
        </div>
        <div>
          <div v-for="item in items" :key="item.id"
               class="flex items-center justify-between px-xl py-md border-b border-hairline-light/60">
            <div class="flex-1">
              <p class="font-medium text-ink" style="font-size:14px;">{{ item.nama_produk }}</p>
              <p class="text-shade-40 mt-xxs" style="font-size:11px;">
                {{ item.kategori }}
                <span class="mx-xs">·</span>
                <span style="font-family:monospace;">{{ item.kode_sku }}</span>
              </p>
            </div>
            <div class="text-right ml-xl flex-shrink-0">
              <p class="text-shade-50 text-caption">{{ item.jumlah }} × {{ rupiah(item.harga_satuan) }}</p>
              <p class="font-semibold text-ink mt-xxs" style="font-size:14px;">{{ rupiah(item.subtotal) }}</p>
            </div>
          </div>
          <div v-if="!items.length" class="text-center py-xxl text-shade-40 text-caption">
            Tidak ada item.
          </div>
        </div>

        <!-- Total -->
        <div class="flex items-center justify-between px-xl py-lg"
             style="background:#c1fbd4;border-top:1px solid #a8f0bf;">
          <p class="font-display font-semibold text-ink" style="font-size:16px;">Total Pembayaran</p>
          <p class="font-display font-semibold text-ink" style="font-size:24px;">
            {{ rupiah(pesanan.total_harga) }}
          </p>
        </div>
      </div>

      <!-- Toast -->
      <BaseToast ref="toast" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import BaseToast from '@/components/BaseToast.vue'

const route        = useRoute()
const loading      = ref(true), err = ref(null)
const pesanan      = ref(null), items = ref([])
const newStatus    = ref(''), savingStatus = ref(false)
const toast        = ref(null)

const statusOptions = ['pending','diproses','dikirim','selesai','dibatalkan']

function rupiah(n){ return 'Rp\u00A0'+Number(n||0).toLocaleString('id-ID') }
function tglLengkap(d){
  if(!d)return'—'
  return new Date(d).toLocaleString('id-ID',{
    day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'
  })
}
function labelBayar(m){
  return{tunai:'Tunai',transfer:'Transfer Bank',qris:'QRIS',kartu_kredit:'Kartu Kredit'}[m]||m
}
function statusPill(s){
  return{selesai:'bg-aloe-10 text-ink',pending:'bg-shade-30/40 text-shade-60',
         diproses:'bg-blue-100 text-blue-700',dikirim:'bg-purple-100 text-purple-700',
         dibatalkan:'bg-red-100 text-red-600'}[s]||''
}

async function load(){
  loading.value=true; err.value=null
  try{
    const{data}=await api.get(`/pesanan/${route.params.id}`)
    pesanan.value  = data.data.pesanan
    items.value    = data.data.items || []
    newStatus.value= data.data.pesanan.status
  }catch(e){ err.value=e.response?.data?.message||e.message }
  finally{ loading.value=false }
}

async function updateStatus(){
  savingStatus.value=true
  try{
    await api.patch(`/pesanan/${route.params.id}/status`,{status:newStatus.value})
    pesanan.value.status=newStatus.value
    toast.value.show('Status berhasil diperbarui')
  }catch(e){ toast.value.show(e.response?.data?.message||'Gagal update status','error') }
  finally{ savingStatus.value=false }
}

onMounted(load)
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
.spinner-xs{width:12px;height:12px;border:2px solid rgba(0,0,0,.2);border-top-color:#000;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
