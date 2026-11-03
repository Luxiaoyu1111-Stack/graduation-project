import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/FrontLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/front/Home.vue') },
      { path: 'homestays', name: 'homestays', component: () => import('../views/front/HomestayList.vue') },
      { path: 'homestays/:id', name: 'homestayDetail', component: () => import('../views/front/HomestayDetail.vue') },
      { path: 'orders', name: 'myOrders', component: () => import('../views/front/MyOrders.vue'), meta: { auth: true, role: 'USER' } },
      { path: 'reviews', name: 'myReviews', component: () => import('../views/front/MyReviews.vue'), meta: { auth: true, role: 'USER' } },
      { path: 'favorites', name: 'myFavorites', component: () => import('../views/front/MyFavorites.vue'), meta: { auth: true, role: 'USER' } },
      { path: 'profile', name: 'profile', component: () => import('../views/front/Profile.vue'), meta: { auth: true } }
    ]
  },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue') },
  {
    path: '/merchant',
    component: () => import('../layouts/ManageLayout.vue'),
    meta: { auth: true, role: 'MERCHANT' },
    children: [
      { path: '', redirect: '/merchant/dashboard' },
      { path: 'dashboard', component: () => import('../views/merchant/Dashboard.vue') },
      { path: 'homestays', component: () => import('../views/merchant/Homestays.vue') },
      { path: 'rooms', component: () => import('../views/merchant/Rooms.vue') },
      { path: 'inventory', component: () => import('../views/merchant/Inventory.vue') },
      { path: 'orders', component: () => import('../views/merchant/Orders.vue') },
      { path: 'reviews', component: () => import('../views/merchant/Reviews.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('../layouts/ManageLayout.vue'),
    meta: { auth: true, role: 'ADMIN' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'users', component: () => import('../views/admin/Users.vue') },
      { path: 'merchants', component: () => import('../views/admin/Merchants.vue') },
      { path: 'homestays', component: () => import('../views/admin/Homestays.vue') },
      { path: 'orders', component: () => import('../views/admin/Orders.vue') },
      { path: 'reviews', component: () => import('../views/admin/Reviews.vue') },
      { path: 'announcements', component: () => import('../views/admin/Announcements.vue') },
      { path: 'settings', component: () => import('../views/admin/Settings.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const store = useUserStore()
  const auth = to.meta.auth
  const role = to.meta.role
  if (auth && !store.isLogin) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (role && store.role !== role) {
    if (store.isAdmin) return '/admin/dashboard'
    if (store.isMerchant) return '/merchant/dashboard'
    return '/'
  }
  return true
})

export default router
