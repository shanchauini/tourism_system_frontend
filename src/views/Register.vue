<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <form @submit.prevent="handleSubmit" class="register-form">
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
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            required
            placeholder="请再次输入密码"
          />
        </div>
        <div class="form-group">
          <label for="nickName">昵称</label>
          <input
            type="text"
            id="nickName"
            v-model="form.nickName"
            required
            placeholder="请输入昵称"
          />
        </div>
        <div class="form-group">
          <label for="gender">性别</label>
          <select id="gender" v-model="form.gender" required>
            <option value="">请选择性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label for="phone">手机号码</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            required
            placeholder="请输入手机号码"
          />
        </div>
        <div class="form-group">
          <label for="location">所在地</label>
          <input
            type="text"
            id="location"
            v-model="form.location"
            required
            placeholder="请输入所在地"
          />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div class="links">
          <router-link to="/login" class="link">已有账号？去登录</router-link>
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
const loading = ref(false);

const form = reactive({
  userID: '',
  password: '',
  confirmPassword: '',
  nickName: '',
  gender: '',
  phone: '',
  location: ''
});

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    const success = await userStore.registerUser({
      userID: form.userID,
      password: form.password,
      userType:'TOURIST',//?
      nickName: form.nickName,
      gender: form.gender,
      phone: form.phone,
      location: form.location
    });

    if (success) {
      alert('注册成功，请登录');
      router.push('/login');
    } else {
      alert('注册失败，请稍后重试');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: calc(100vh - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-box {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.register-form {
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
input[type="password"],
input[type="tel"],
select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="tel"]:focus,
select:focus {
  border-color: #1890ff;
  outline: none;
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
</style> 