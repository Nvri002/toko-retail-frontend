import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard',       name: 'Dashboard',      component: () => import('@/views/DashboardView.vue') },
      { path: 'kategori',        name: 'Kategori',       component: () => import('@/views/KategoriView.vue') },
      { path: 'produk',          name: 'Produk',         component: () => import('@/views/produk/ProdukList.vue') },
      { path: 'produk/tambah',   name: 'ProdukTambah',   component: () => import('@/views/produk/ProdukForm.vue') },
      { path: 'produk/:id/edit', name: 'ProdukEdit',     component: () => import('@/views/produk/ProdukForm.vue') },
      { path: 'pelanggan',             name: 'Pelanggan',       component: () => import('@/views/pelanggan/PelangganList.vue') },
      { path: 'pelanggan/tambah',      name: 'PelangganTambah', component: () => import('@/views/pelanggan/PelangganForm.vue') },
      { path: 'pelanggan/:id/edit',    name: 'PelangganEdit',   component: () => import('@/views/pelanggan/PelangganForm.vue') },
      { path: 'pelanggan/:id',         name: 'PelangganDetail', component: () => import('@/views/pelanggan/PelangganDetail.vue') },
      { path: 'pesanan',         name: 'Pesanan',        component: () => import('@/views/pesanan/PesananList.vue') },
      { path: 'pesanan/tambah',  name: 'PesananTambah',  component: () => import('@/views/pesanan/PesananForm.vue') },
      { path: 'pesanan/:id',     name: 'PesananDetail',  component: () => import('@/views/pesanan/PesananDetail.vue') },
      { path: 'statistik',       name: 'Statistik',      component: () => import('@/views/StatistikView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return { name: 'Login' }
  if (to.meta.public && token) return { name: 'Dashboard' }
})

export default router
