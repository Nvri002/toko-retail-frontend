import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn  = computed(() => !!token.value)
  const displayName = computed(() => user.value?.nama || user.value?.username || 'User')
  const isAdmin     = computed(() => user.value?.role === 'admin')

  // Login ke backend JWT — POST /api/auth/login
  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password })
    
    // Simpan token JWT dari backend
    token.value = data.data.token
    user.value  = data.data.user

    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))

    return data.data.user
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { user, token, isLoggedIn, displayName, isAdmin, login, logout }
})
