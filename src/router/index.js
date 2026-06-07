import { createRouter, createWebHashHistory } from 'vue-router' // Hash mode သုံးရန်

// Route definitions များ (သင့်တည်ဆောက်ထားသည့်အတိုင်း)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  // ... ကျန်သော routes များ
]

const router = createRouter({
  history: createWebHashHistory(), // ဤနေရာတွင် Hash mode ကို သေချာသုံးပါ။
  routes,
})

// Navigation guard (အနည်းငယ် ပြင်ဆင်ရန်)
router.beforeEach((to, from, next) => {
  // localStorage ကို token စစ်ဆေးခြင်း (path ပေါ်မူတည်၍)
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login')
  } 
  // Login ဝင်ပြီးသားသူ login page ကို သွားလျှင် dashboard သို့ ပြန်ညွှန်းရန်
  else if (to.path === '/login' && localStorage.getItem('token')) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router