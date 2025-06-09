import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/attractions',
      name: 'attractions',
      component: () => import('../views/Attractions.vue')
    },
    {
      path: '/attractions/:id',
      name: 'attraction-detail',
      component: () => import('../views/AttractionDetail.vue')
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/Articles.vue')
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('../views/ArticleDetail.vue')
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserCenter.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'articles',
          name: 'user-articles',
          component: () => import('../views/Articles.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'articles/edit/:id',
          name: 'edit-article',
          component: () => import('../views/ArticleEdit.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'articles/new',
          name: 'new-article',
          component: () => import('../views/ArticleEdit.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'user-orders',
          component: () => import('../views/UserOrders.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    // 管理员路由
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'attractions',
          name: 'admin-attractions',
          component: () => import('../views/admin/AttractionsManagement.vue')
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('../views/admin/ArticlesManagement.vue')
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/OrdersManagement.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/UsersManagement.vue')
        }
      ]
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !userStore.user) {
    next('/login');
  } else if (requiresAdmin && userStore.userType !== 'admin') {
    next('/');
  } else {
    next();
  }
});

export default router; 