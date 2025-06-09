<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">
        <div class="admin-sidebar">
          <div class="logo">
            <h2>管理后台</h2>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="admin-menu"
            router
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataLine /></el-icon>
              <span>控制台</span>
            </el-menu-item>
            <el-menu-item index="/admin/attractions">
              <el-icon><Location /></el-icon>
              <span>景点管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/articles">
              <el-icon><Document /></el-icon>
              <span>文章管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/orders">
              <el-icon><Tickets /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header height="60px">
          <div class="admin-header">
            <div class="header-left">
              <el-breadcrumb>
                <el-breadcrumb-item>管理后台</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  {{ userStore.user?.userID }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';
import {
  DataLine,
  Location,
  Document,
  Tickets,
  User,
  ArrowDown
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

const currentPage = computed(() => {
  const pathMap: Record<string, string> = {
    '/admin/dashboard': '控制台',
    '/admin/attractions': '景点管理',
    '/admin/articles': '文章管理',
    '/admin/orders': '订单管理',
    '/admin/users': '用户管理'
  };
  return pathMap[route.path] || '';
});

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  background-color: #f5f7fa;
}

.admin-sidebar {
  height: 100%;
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 18px;
}

.admin-menu {
  border-right: none;
  background-color: #304156;
}

.admin-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.admin-menu :deep(.el-menu-item.is-active) {
  color: #409eff;
  background-color: #263445;
}

.admin-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
}

.admin-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-info .el-icon {
  margin-left: 5px;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style> 