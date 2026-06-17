<template>
  <div>
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-xl">
      <p class="text-shade-50 text-caption">{{ total }} kategori terdaftar</p>
      <button class="btn-primary btn-sm" @click="openAdd">+ Tambah Kategori</button>
    </div>

    <!-- Table card -->
    <div class="card p-0 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-huge">
        <div class="spinner-dark"></div>
      </div>
      <div v-else-if="err" class="text-center py-xxl">
        <p class="text-shade-50 text-caption mb-md">{{ err }}</p>
        <button class="btn-primary btn-sm" @click="load">Coba Lagi</button>
      </div>
      <template v-else>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th class="text-center">Jumlah Produk</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(k, i) in rows" :key="k.id">
              <td class="text-shade-40 text-caption">{{ i + 1 }}</td>
              <td class="font-medium">{{ k.nama }}</td>
              <td class="text-shade-50 text-caption">{{ k.deskripsi || '—' }}</td>
              <td class="text-center">
                <span class="pill-mint" style="font-size:11px;">{{ k.jumlah_produk }}</span>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-xs">
                  <button class="btn-outline-light btn-sm" @click="openEdit(k)">Edit</button>
                  <button class="btn-sm rounded-pill px-md py-xs border border-red-200 text-red-500 hover:bg-red-50 transition-colors bg-transparent cursor-pointer font-body"
                          style="font-size:12px;" @click="hapus(k)">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="5" class="text-center text-shade-40 py-xxl">Belum ada kategori.</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <!-- Modal Tambah/Edit -->
    <BaseModal v-model="modal" max-width="440px">
      <template #title>{{ isEdit ? 'Edit Kategori' : 'Tambah Kategori' }}</template>
      <form @submit.prevent="simpan" class="flex flex-col gap-lg">
        <div>
          <label class="label">Nama Kategori <span class="text-red-400">*</span></label>
          <input v-model="form.nama" class="input" :class="{'input-error':fErr.nama}"
                 placeholder="Contoh: Elektronik" />
          <p v-if="fErr.nama" class="text-red-400 mt-xs" style="font-size:12px;">{{ fErr.nama }}</p>
        </div>
        <div>
          <label class="label">Deskripsi</label>
          <textarea v-model="form.deskripsi" class="input" rows="3"
                    placeholder="Deskripsi singkat (opsional)"></textarea>
        </div>
        <p v-if="fErr.global" class="text-red-400 text-caption">{{ fErr.global }}</p>
        <div class="flex gap-sm pt-sm">
          <button type="button" class="btn-outline-light flex-1" @click="modal=false">Batal</button>
          <button type="submit" class="btn-primary flex-1" :disabled="saving">
            <span v-if="saving" class="spinner-sm"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseToast ref="toast" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import BaseModal from '@/components/BaseModal.vue'
import BaseToast from '@/components/BaseToast.vue'

const loading = ref(true)
const err     = ref(null)
const rows    = ref([])
const total   = ref(0)
const modal   = ref(false)
const isEdit  = ref(false)
const saving  = ref(false)
const toast   = ref(null)
const form    = reactive({ id: null, nama: '', deskripsi: '' })
const fErr    = reactive({ nama: '', global: '' })

async function load() {
  loading.value = true; err.value = null
  try {
    const { data } = await api.get('/kategori')
    rows.value  = data.data || []
    total.value = rows.value.length
  } catch (e) { err.value = e.response?.data?.message || e.message }
  finally { loading.value = false }
}

function openAdd() {
  isEdit.value = false
  Object.assign(form, { id: null, nama: '', deskripsi: '' })
  Object.assign(fErr, { nama: '', global: '' })
  modal.value = true
}

function openEdit(k) {
  isEdit.value = true
  Object.assign(form, { id: k.id, nama: k.nama, deskripsi: k.deskripsi || '' })
  Object.assign(fErr, { nama: '', global: '' })
  modal.value = true
}

function validate() {
  fErr.nama = ''; fErr.global = ''
  if (!form.nama.trim()) { fErr.nama = 'Nama wajib diisi'; return false }
  return true
}

async function simpan() {
  if (!validate()) return
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/kategori/${form.id}`, { nama: form.nama, deskripsi: form.deskripsi })
      toast.value.show('Kategori berhasil diperbarui')
    } else {
      await api.post('/kategori', { nama: form.nama, deskripsi: form.deskripsi })
      toast.value.show('Kategori berhasil ditambahkan')
    }
    modal.value = false
    load()
  } catch (e) { fErr.global = e.response?.data?.message || 'Gagal menyimpan' }
  finally { saving.value = false }
}

async function hapus(k) {
  if (!confirm(`Hapus kategori "${k.nama}"?`)) return
  try {
    await api.delete(`/kategori/${k.id}`)
    toast.value.show('Kategori berhasil dihapus')
    load()
  } catch (e) { toast.value.show(e.response?.data?.message || 'Gagal menghapus', 'error') }
}

onMounted(load)
</script>

<style scoped>
.spinner-dark{width:32px;height:32px;border:3px solid #e4e4e7;border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;}
.spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
