import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

// 获取景点的所有门票
export const getTicketsByAttractionId = (attractionID: number) => {
  return axios.get(`${baseURL}/ticket/list`, {
    params: { attractionID }
  });
};

// 获取门票详情
export const getTicketDetail = (ticketID: number) => {
  return axios.get(`${baseURL}/ticket/detail`, {
    params: { ticketID }
  });
};

// 添加新门票（管理员）
export const addTicket = (data: {
  attractionID: number;
  type: string;
  price: number;
  stock: number;
  description: string;
}) => {
  return axios.post(`${baseURL}/ticket/add`, data);
};

// 更新门票信息（管理员）
export const updateTicket = (data: {
  ticketID: number;
  type: string;
  price: number;
  stock: number;
  description: string;
}) => {
  return axios.post(`${baseURL}/ticket/update`, data);
};

// 删除门票（管理员）
export const deleteTicket = (ticketID: number) => {
  return axios.post(`${baseURL}/ticket/delete`, null, {
    params: { ticketID }
  });
};

// 更新门票库存（管理员）
export const updateTicketStock = (ticketID: number, newStock: number) => {
  return axios.post(`${baseURL}/ticket/update_stock`, null, {
    params: { ticketID, newStock }
  });
}; 