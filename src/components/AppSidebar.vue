<template>
  <aside class="fixed top-0 left-0 h-screen flex flex-col z-40"
         style="width:240px; background:#0a0a0a; border-right:1px solid rgba(255,255,255,0.06);">

    <!-- Brand -->
    <div class="px-xl py-xxl border-b" style="border-color:rgba(255,255,255,0.06);">
      <div class="flex items-center gap-sm">
        <div class="flex items-center justify-center rounded-md bg-aloe-10"
             style="width:32px;height:32px;flex-shrink:0;">
          <span style="font-size:16px;">🛒</span>
        </div>
        <div>
          <p class="text-white font-body font-semibold leading-none" style="font-size:14px;">TokoRetail</p>
          <p style="font-size:11px;color:#52525b;margin-top:2px;">Management System</p>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-md py-lg">
      <p class="text-eyebrow font-medium tracking-widest uppercase px-sm mb-sm"
         style="color:#3f3f46;font-size:10px;">Menu Utama</p>

      <RouterLink v-for="item in navItems" :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'nav-link--active': isActive(item.to) }">
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- User info -->
    <div class="px-md py-lg border-t" style="border-color:rgba(255,255,255,0.06);">
      <div class="flex items-center gap-sm px-sm py-xs rounded-md cursor-pointer"
           style="transition:background .15s;"
           @mouseenter="e => e.currentTarget.style.background='rgba(255,255,255,0.04)'"
           @mouseleave="e => e.currentTarget.style.background='transparent'">
        <div class="flex items-center justify-center rounded-pill bg-aloe-10 flex-shrink-0"
             style="width:30px;height:30px;font-size:12px;font-weight:700;color:#000;">
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-white font-medium truncate" style="font-size:13px;">{{ displayName }}</p>
          <p style="font-size:11px;color:#52525b;text-transform:capitalize;">{{ role }}</p>
        </div>
        <button @click="handleLogout"
          class="text-shade-50 hover:text-white transition-colors"
          style="font-size:14px;background:none;border:none;cursor:pointer;"
          title="Logout">
          ↪
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const displayName = computed(() => auth.user?.nama || auth.user?.username || 'User')
const role        = computed(() => auth.user?.role || 'staff')
const initials    = computed(() => {
  const n = displayName.value
  return n.split(' ').slice(0,2).map(w => w[0].toUpperCase()).join('')
})

const navItems = [
  { to: '/dashboard',  icon: '◈',  label: 'Dashboard'  },
  { to: '/kategori',   icon: '⊟',  label: 'Kategori'   },
  { to: '/produk',     icon: '▦',  label: 'Produk'     },
  { to: '/pelanggan',  icon: '⊛',  label: 'Pelanggan'  },
  { to: '/pesanan',    icon: '⊞',  label: 'Pesanan'    },
  { to: '/statistik',  icon: '◎',  label: 'Statistik'  },
]

function isActive(to) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: #52525b;
  text-decoration: none;
  margin-bottom: 2px;
  transition: all .15s;
}
.nav-link:hover {
  background: rgba(255,255,255,0.05);
  color: #a1a1aa;
}
.nav-link--active {
  background: rgba(193,251,212,0.12);
  color: #c1fbd4;
}
.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 15px;
  flex-shrink: 0;
}
</style>
