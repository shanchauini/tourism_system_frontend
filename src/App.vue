<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="logo">旅游信息系统</router-link>
      </div>
      <div class="navbar-menu">
        <router-link to="/attractions" class="nav-item">景点</router-link>
        <router-link to="/articles" class="nav-item">文章</router-link>
        <template v-if="userStore.user">
          <router-link to="/user" class="nav-item">个人中心</router-link>
          <a @click="handleLogout" class="nav-item">退出</a>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="nav-item">注册</router-link>
        </template>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <p>&copy; 2025 旅游信息系统. All rights reserved.</p>
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
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo {
  color: #333;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: #666;
  text-decoration: none;
  padding: 0.5rem;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #1890ff;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: #fff;
  padding: 1rem;
  text-align: center;
  color: #666;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style> 