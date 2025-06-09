import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

// 创建新订单
export const createOrder = (data: {
  userID: number;
  attractionID: number;
  ticketID: number;
  orderType: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
}) => {
  return axios.post(`${baseURL}/ticket-order/create`, data);
};

// 获取订单模板
export const getOrderTemplate = () => {
  return axios.get(`${baseURL}/ticket-order/template`);
};

// 取消订单
export const cancelOrder = (orderID: number) => {
  return axios.post(`${baseURL}/ticket-order/cancel`, null, {
    params: { orderID }
  });
};

// 获取订单详情
export const getOrderDetail = (orderID: number) => {
  return axios.get(`${baseURL}/ticket-order/detail`, {
    params: { orderID }
  });
};

// 获取用户的所有订单
export const getUserOrders = (userID: number) => {
  return axios.get(`${baseURL}/ticket-order/user-orders`, {
    params: { userID }
  });
};

// 获取景点的所有订单
export const getAttractionOrders = (attractionID: number) => {
  return axios.get(`${baseURL}/ticket-order/attraction-orders`, {
    params: { attractionID }
  });
}; 