<template>
  <div class="app">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <router-link to="/" class="logo">旅游信息系统</router-link>
        </div>
        <div class="navbar-menu">
          <template v-if="userStore.userType === 'admin'">
            <!-- <router-link to="/admin/dashboard" class="nav-item">控制台</router-link> -->
            <router-link to="/admin/attractions" class="nav-item">景点管理</router-link>
            <router-link to="/admin/articles" class="nav-item">文章管理</router-link>
            <!-- <router-link to="/admin/orders" class="nav-item">订单管理</router-link> -->
            <!-- <router-link to="/admin/users" class="nav-item">用户管理</router-link> -->
            <a @click="handleLogout" class="nav-item">退出</a>
          </template>
          <template v-else-if="userStore.userType === 'tourist'">
            <router-link to="/attractions" class="nav-item">景点</router-link>
            <router-link to="/articles" class="nav-item">文章</router-link>
            <router-link to="/user/UserCenter" class="nav-item">个人中心</router-link>
            <a @click="handleLogout" class="nav-item">退出</a>
          </template>
          <template v-else>
            <router-link to="/attractions" class="nav-item">景点</router-link>
            <router-link to="/articles" class="nav-item">文章</router-link>
            <router-link to="/login" class="nav-item">登录</router-link>
            <router-link to="/register" class="nav-item">注册</router-link>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 旅游信息系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  font-size: 16px;
  line-height: 1.6;
  min-width: 1200px;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.8rem;
  font-weight: bold;
}

.logo {
  color: #333;
  text-decoration: none;
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  gap: 2.5rem;
}

.nav-item {
  color: #666;
  text-decoration: none;
  padding: 0.5rem;
  transition: color 0.3s;
  font-size: 1.1rem;
  font-weight: 500;
  position: relative;
}

.nav-item:hover {
  color: #1890ff;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: #fff;
  padding: 1.5rem 0;
  text-align: center;
  color: #666;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}

@media (min-width: 1600px) {
  .container {
    max-width: 1520px;
  }
}
</style> 