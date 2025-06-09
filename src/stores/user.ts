import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login, register, updateUserInfo } from '../api/user';
import type { User } from '../types/index';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const userType = ref<'tourist' | 'admin' | null>(null);

  // 登录
  const loginUser = async (userID: string, password: string) => {
    try {
      const response = await login({userID, password});
      user.value = response.data;
      userType.value = response.data.userType;
      // 存储用户信息到sessionStorage
      sessionStorage.setItem('user', JSON.stringify(response.data));
      sessionStorage.setItem('userType', response.data.userType);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  // 注册
  const registerUser = async (userData: {
    userID: string;
    password: string;
    userType:string;
    nickName: string;
    gender: string;
    phone: string;
    location: string;
  }) => {
    try {
      const response = await register(userData);
      user.value = response.data;
      userType.value = 'tourist';
      // 存储用户信息到sessionStorage
      sessionStorage.setItem('user', JSON.stringify(response.data));
      sessionStorage.setItem('userType', 'tourist');
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  // 更新用户信息
  const updateUser = async (userData: {
    userID: string;
    password: string;
    userType:string;
    nickName: string;
    gender: string;
    phone: string;
    location: string;
  }) => {
    try {
      const response = await updateUserInfo(userData);
      user.value = response.data;
      // 更新sessionStorage中的用户信息
      sessionStorage.setItem('user', JSON.stringify(response.data));
      return true;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  };

  // 登出
  const logout = () => {
    user.value = null;
    userType.value = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userType');
  };

  // 检查是否已登录
  const checkAuth = () => {
    const storedUser = sessionStorage.getItem('user');
    const storedUserType = sessionStorage.getItem('userType');
    if (storedUser && storedUserType) {
      user.value = JSON.parse(storedUser);
      userType.value = storedUserType as 'tourist' | 'admin';
      return true;
    }
    return false;
  };

  return {
    user,
    userType,
    loginUser,
    registerUser,
    updateUser,
    logout,
    checkAuth
  };
}); 