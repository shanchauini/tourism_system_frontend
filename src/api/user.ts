import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

// 用户登录接口
export const login = (data: { userID: string; password: string }) => {
  return axios.post(`${baseURL}/tourist/login`, data);
};

// 用户注册接口
export const register = (data: {
  userID: string;
  password: string;
  userType:string;
  nickName: string;
  gender: string;
  phone: string;
  location: string;
}) => {
  return axios.post(`${baseURL}/tourist/register`, data);
};

// 更新用户信息接口
export const updateUserInfo = (data: {
  userID: string;
  password:string;
  userType:string;
  nickName: string;
  gender: string;
  phone: string;
  location: string;
}) => {
  return axios.post(`${baseURL}/tourist/update_tourist_info`, data);
};

// 管理员登录接口
export const adminLogin = (data: { userID: string; password: string }) => {
  return axios.post(`${baseURL}/admin/login`, data);
};

// 管理员注册接口
export const adminRegister = (data: { userID: string; password: string;userType:string }) => {
  return axios.post(`${baseURL}/admin/register`, data);
};

// 管理员修改密码接口
export const updateAdminPassword = (data: { userID: string; password: string }) => {
  return axios.post(`${baseURL}/admin/update_password`, data);
}; 