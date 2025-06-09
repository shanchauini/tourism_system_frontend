import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/attractions',
      name: 'Attractions',
      component: () => import('../views/Attractions.vue')
    },
    {
      path: '/attractions/:id',
      name: 'AttractionDetail',
      component: () => import('../views/AttractionDetail.vue')
    },
    {
      path: '/articles',
      name: 'Articles',
      component: () => import('../views/Articles.vue')
    },
    {
      path: '/articles/:id',
      name: 'ArticleDetail',
      component: () => import('../views/ArticleDetail.vue')
    },
    {
      path: '/articles/edit/:id?',
      name: 'ArticleEdit',
      component: () => import('../views/ArticleEdit.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user',
      name: 'UserCenter',
      component: () => import('../views/UserCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.checkAuth();

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && userStore.userType !== 'admin') {
    next('/');
    return;
  }

  next();
});

export default router; 