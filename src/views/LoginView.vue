<template>
  <div class="min-h-screen flex items-center justify-center bg-canvas-cream px-lg">
    <div class="w-full" style="max-width:400px;">
      <!-- Brand -->
      <div class="text-center mb-xxl">
        <div class="inline-flex items-center justify-center rounded-2xl mb-lg"
             style="width:56px;height:56px;background:#000;">
          <span style="font-size:26px;">🛒</span>
        </div>
        <h1 class="font-display font-semibold text-ink" style="font-size:24px;">TokoRetail</h1>
        <p class="text-shade-50 mt-xs text-caption">Panel Manajemen</p>
      </div>

      <!-- Card -->
      <div class="card">
        <!-- Error -->
        <div v-if="errorMsg"
             class="bg-red-50 border border-red-200 rounded-lg px-lg py-md mb-xl">
          <p class="text-red-600 text-caption">{{ errorMsg }}</p>
        </div>

        <div class="flex flex-col gap-lg">
          <div>
            <label class="block text-caption font-medium text-ink mb-xs">Username</label>
            <input v-model="form.username" type="text" placeholder="admin"
                   class="w-full border border-hairline-light rounded-lg px-lg py-md text-ink bg-white
                          focus:outline-none focus:border-ink transition-colors"
                   style="font-size:14px;"
                   @keyup.enter="submit"/>
          </div>
          <div>
            <label class="block text-caption font-medium text-ink mb-xs">Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••"
                   class="w-full border border-hairline-light rounded-lg px-lg py-md text-ink bg-white
                          focus:outline-none focus:border-ink transition-colors"
                   style="font-size:14px;"
                   @keyup.enter="submit"/>
          </div>

          <button class="btn-primary w-full justify-center mt-sm"
                  :disabled="loading" @click="submit">
            <span v-if="loading" class="spinner-sm mr-sm"></span>
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>
        </div>

        <!-- Hint -->
        <div class="mt-xl pt-xl border-t border-hairline-light text-center">
          <p class="text-shade-40" style="font-size:11px;">
            Default: <span class="font-mono">admin</span> / <span class="font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const loading  = ref(false)
const errorMsg = ref('')
const form     = reactive({ username: '', password: '' })

async function submit() {
  if (!form.username || !form.password) {
    errorMsg.value = 'Username dan password wajib diisi.'
    return
  }
  loading.value  = true
  errorMsg.value = ''
  try {
    await authStore.login(form.username.trim(), form.password)
    router.push('/dashboard')
  } catch (e) {
    // Tampilkan pesan error dari backend
    errorMsg.value = e.response?.data?.message || e.message || 'Login gagal.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.spinner-sm {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }
</style>
