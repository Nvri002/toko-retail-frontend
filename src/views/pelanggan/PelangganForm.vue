<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-md mb-xxl">
      <RouterLink to="/pelanggan"
        class="flex items-center justify-center rounded-pill border border-hairline-light
               bg-canvas-light hover:border-ink transition-colors"
        style="width:36px;height:36px;font-size:16px;text-decoration:none;color:#000;">←</RouterLink>
      <div>
        <h2 class="font-display font-semibold text-ink" style="font-size:20px;">
          {{ isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan' }}
        </h2>
        <p class="text-shade-40 text-caption">{{ isEdit ? `ID #${route.params.id}` : 'Isi data pelanggan baru' }}</p>
      </div>
    </div>

    <div v-if="loadingData" class="flex justify-center py-huge"><div class="spinner-dark"></div></div>

    <form v-else @submit.prevent="simpan" class="flex flex-col gap-xl">
      <!-- Identitas -->
      <div class="card flex flex-col gap-lg">
        <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Identitas</h3>
        <div>
          <label class="label">Nama Lengkap <span class="text-red-400">*</span></label>
          <input v-model="form.nama" class="input" :class="{'input-error':fErr.nama}"
                 placeholder="Nama lengkap pelanggan" />
          <p v-if="fErr.nama" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.nama }}</p>
        </div>
        <div>
          <label class="label">Email <span class="text-red-400">*</span></label>
          <input v-model="form.email" type="email" class="input" :class="{'input-error':fErr.email}"
                 placeholder="email@contoh.com" />
          <p v-if="fErr.email" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.email }}</p>
        </div>
        <div class="grid grid-cols-2 gap-lg">
          <div>
            <label class="label">Telepon</label>
            <input v-model="form.telepon" class="input" placeholder="08xx..." />
          </div>
          <div>
            <label class="label">Kota</label>
            <input v-model="form.kota" class="input" placeholder="Kota asal" />
          </div>
        </div>
        <div>
          <label class="label">Alamat</label>
          <textarea v-model="form.alamat" class="input" rows="3"
                    placeholder="Alamat lengkap (opsional)"></textarea>
        </div>
      </div>

      <!-- Level -->
      <div class="card flex flex-col gap-lg">
        <h3 class="font-display font-semibold text-ink" style="font-size:14px;">Level Pelanggan</h3>
        <div class="grid grid-cols-2 gap-sm">
          <label v-for="lv in levels" :key="lv.value"
                 class="flex items-center gap-sm p-lg rounded-lg border-2 cursor-pointer transition-all"
                 :class="form.level===lv.value ? 'border-ink bg-canvas-light shadow-elev-1' : 'border-hairline-light hover:border-shade-30'">
            <input type="radio" v-model="form.level" :value="lv.value" class="hidden" />
            <span style="font-size:20px;">{{ lv.icon }}</span>
            <div>
              <p class="font-medium text-ink" style="font-size:13px;">{{ lv.label }}</p>
              <p class="text-shade-40" style="font-size:11px;">{{ lv.desc }}</p>
            </div>
          </label>
        </div>
      </div>

      <div v-if="fErr.global"
           class="flex items-center gap-sm px-lg py-md rounded-lg border"
           style="background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2);">
        <span style="color:#f87171;">⚠</span>
        <span class="text-red-500 text-caption">{{ fErr.global }}</span>
      </div>

      <div class="flex gap-sm">
        <RouterLink to="/pelanggan" class="btn-outline-light flex-1 text-center" style="text-decoration:none;">
          Batal
        </RouterLink>
        <button type="submit" class="btn-primary flex-1" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          {{ saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan') }}
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
const isEdit = computed(()=>!!route.params.id)
const loadingData = ref(false), saving = ref(false)
const form = reactive({nama:'',email:'',telepon:'',alamat:'',kota:'',level:'regular'})
const fErr = reactive({nama:'',email:'',global:''})

const levels = [
  {value:'regular',  label:'Regular',  icon:'👤', desc:'Pelanggan biasa'},
  {value:'silver',   label:'Silver',   icon:'🥈', desc:'Pelanggan setia'},
  {value:'gold',     label:'Gold',     icon:'🥇', desc:'Pelanggan premium'},
  {value:'platinum', label:'Platinum', icon:'💎', desc:'Pelanggan VIP'},
]

async function loadData() {
  loadingData.value=true
  try {
    const {data}=await api.get(`/pelanggan/${route.params.id}`)
    const p=data.data
    Object.assign(form,{nama:p.nama,email:p.email,telepon:p.telepon||'',
      alamat:p.alamat||'',kota:p.kota||'',level:p.level})
  } catch(e){ fErr.global=e.response?.data?.message||'Gagal memuat data' }
  finally { loadingData.value=false }
}

function validate() {
  Object.assign(fErr,{nama:'',email:'',global:''})
  let ok=true
  if (!form.nama.trim())  { fErr.nama='Nama wajib diisi'; ok=false }
  if (!form.email.trim()) { fErr.email='Email wajib diisi'; ok=false }
  return ok
}

async function simpan() {
  if (!validate()) return
  saving.value=true
  const payload={nama:form.nama,email:form.email,telepon:form.telepon||undefined,
    alamat:form.alamat||undefined,kota:form.kota||undefined,level:form.level}
  try {
    if (isEdit.value) await api.put(`/pelanggan/${route.params.id}`,payload)
    else await api.post('/pelanggan',payload)
    router.push('/pelanggan')
  } catch(e){ fErr.global=e.response?.data?.message||'Gagal menyimpan' }
  finally { saving.value=false }
}

onMounted(()=>{ if(isEdit.value) loadData() })
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
.spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
