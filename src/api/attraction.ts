import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

// 获取所有景点列表
export const getAllAttractions = () => {
  return axios.get(`${baseURL}/attraction/list`);
};

// 获取景点详情
//这里string之前是number
export const getAttractionDetail = (attractionID: number) => {
  return axios.get(`${baseURL}/attraction/detail`, {
    params: { attractionID } // 改为查询参数
  });
};

// 搜索景点
export const searchAttractions = (params: {
  name?: string;
  address?: string;
  level?: string;
}) => {
  return axios.get(`${baseURL}/attraction/search`, { params });
};

// 添加景点（管理员）
export const addAttraction = (data: {
  attractionName: string;
  attractionLevel: string;
  attractionAddress: string;
  openingHours: string;
  introduction: string;
  coverImage: string;
}) => {
  return axios.post(`${baseURL}/attraction/add`, data);
};

// 更新景点信息（管理员）
export const updateAttraction = (data: {
  attractionID: number;
  attractionName: string;
  attractionLevel: string;
  attractionAddress: string;
  openingHours: string;
  introduction: string;
  coverImage: string;
}) => {
  return axios.post(`${baseURL}/attraction/update`, data);
};

// 删除景点（管理员）
export const deleteAttraction = (attractionID: number) => {
  return axios.post(`${baseURL}/attraction/delete`, null, {
    params: { attractionID }
  });
}; 