<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">{{ isAdmin ? '管理员登录' : '用户登录' }}</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="userID">账号</label>
          <input
            type="text"
            id="userID"
            v-model="form.userID"
            required
            placeholder="请输入账号"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="请输入密码"
          />
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isAdmin" />
            管理员登录
          </label>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="links">
          <router-link to="/register" class="link">注册账号</router-link>
          <span class="divider">|</span>
          <a href="#" class="link">忘记密码？</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const isAdmin = ref(false);
const loading = ref(false);

const form = reactive({
  userID: '',
  password: ''
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const success = isAdmin.value
      ? await userStore.loginUser(form.userID, form.password)
      : await userStore.loginUser(form.userID, form.password);//??

    if (success) {
      router.push(isAdmin.value ? '/admin' : '/home');
    } else {
      alert('登录失败，请检查账号密码是否正确');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-box {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #666;
  font-size: 0.9rem;
}

input[type="text"],
input[type="password"] {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #1890ff;
  outline: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.submit-btn {
  background-color: #1890ff;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #40a9ff;
}

.submit-btn:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

.links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.link {
  color: #1890ff;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover {
  color: #40a9ff;
}

.divider {
  color: #ddd;
}
</style> 